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
      const booking = await markBookingPaid(result.bookingId, {
        provider: getPaymentProvider().id,
        reference: result.reference,
      });
      if (booking) {
        const slug =
          studios.find((s) => s.id === booking.studio_id)?.slug ?? "studio-01";
        await sendBookingConfirmation({
          to: booking.customer_email,
          bookingId: booking.id,
          studioName: studioName(slug),
          date: booking.date,
          startTime: booking.start_time.slice(0, 5),
          endTime: booking.end_time.slice(0, 5),
          durationHours: booking.duration,
          totalPaid: `${site.booking.currencySymbol}${Number(booking.total_price).toFixed(0)}`,
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
