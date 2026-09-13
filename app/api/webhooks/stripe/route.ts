import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { getBooking, markBookingPaid, markBookingFailed, studioName } from "@/lib/server/bookings";
import { sendBookingConfirmation } from "@/lib/email";
import { site } from "@/lib/site";
import { studios } from "@/lib/studios";

export const dynamic = "force-dynamic";
// Stripe needs the raw, unparsed body to verify the signature.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");

  let result;
  try {
    result = await getPaymentProvider().parseWebhook(raw, signature);
  } catch (err) {
    console.error("[webhook] parse", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    if (result.type === "payment_succeeded") {
      const rows = await Promise.all(
        result.bookingIds.map(async (id) => {
          const row = await getBooking(id);
          const amountPaid = row ? Number(row.total_price) : undefined;
          return markBookingPaid(id, {
            provider: getPaymentProvider().id,
            reference: result.reference,
            amountPaid,
          });
        }),
      );
      const booked = rows.filter((r): r is NonNullable<typeof r> => Boolean(r));
      const first = booked[0];
      if (first) {
        const slug = studios.find((s) => s.id === first.studio_id)?.slug ?? "studio-01";
        const sym = site.booking.currencySymbol;
        const total = booked.reduce((sum, b) => sum + Number(b.total_price), 0);
        const dateLabel = booked.map((b) => b.date).join(", ");
        await sendBookingConfirmation({
          to: first.customer_email,
          bookingId: booked.map((b) => b.id).join(", "),
          studioName: studioName(slug),
          date: dateLabel,
          startTime: first.start_time.slice(0, 5),
          endTime: first.end_time.slice(0, 5),
          durationHours: first.duration,
          addOns: (first.add_ons ?? []).map((a) => a.name),
          totalPaid: `${sym}${total.toFixed(0)}`,
          balanceDue: null,
        });
      }
    } else if (result.type === "payment_failed") {
      await Promise.allSettled(result.bookingIds.map((id) => markBookingFailed(id)));
    }
  } catch (err) {
    console.error("[webhook] handle", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
