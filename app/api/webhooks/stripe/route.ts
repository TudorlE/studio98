import { NextRequest, NextResponse } from "next/server";
import { getPaymentProvider } from "@/lib/payments";
import { markBookingPaid, markBookingFailed, studioName } from "@/lib/server/bookings";
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
      const amountPaid = result.amount ? result.amount / 100 : undefined;
      const booking = await markBookingPaid(result.bookingId, {
        provider: getPaymentProvider().id,
        reference: result.reference,
        amountPaid,
      });
      if (booking) {
        const slug =
          studios.find((s) => s.id === booking.studio_id)?.slug ?? "studio-01";
        const sym = site.booking.currencySymbol;
        const paid = amountPaid ?? Number(booking.total_price);
        const balance = Math.max(0, Number(booking.total_price) - paid);
        await sendBookingConfirmation({
          to: booking.customer_email,
          bookingId: booking.id,
          studioName: studioName(slug),
          date: booking.date,
          startTime: booking.start_time.slice(0, 5),
          endTime: booking.end_time.slice(0, 5),
          durationHours: booking.duration,
          addOns: (booking.add_ons ?? []).map((a) => a.name),
          totalPaid: `${sym}${paid.toFixed(0)}`,
          balanceDue: balance > 0 ? `${sym}${balance.toFixed(0)}` : null,
        });
      }
    } else if (result.type === "payment_failed") {
      await markBookingFailed(result.bookingId);
    }
  } catch (err) {
    console.error("[webhook] handle", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
