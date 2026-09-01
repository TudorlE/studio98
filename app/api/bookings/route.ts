import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validation";
import { calcTotal, endTimeFor } from "@/lib/booking";
import { site } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  createHold,
  markBookingPaid,
  BookingConflictError,
  studioName,
} from "@/lib/server/bookings";
import { getPaymentProvider, isPaymentConfigured } from "@/lib/payments";
import { sendBookingConfirmation } from "@/lib/email";
import type { StudioSlug } from "@/lib/studios";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const slug = input.studio as StudioSlug;
  const total = calcTotal(slug, input.durationHours);
  const currency = site.booking.currency;
  const origin = req.nextUrl.origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Booking backend is not configured yet. Add Supabase credentials to enable real reservations.",
        demo: true,
      },
      { status: 503 },
    );
  }

  // 1. Create the hold (authoritative overlap protection lives in Postgres).
  let bookingId: string;
  try {
    const booking = await createHold({
      slug,
      date: input.date,
      startTime: input.startTime,
      durationHours: input.durationHours,
      totalPrice: total,
      currency,
      customer: input.customer,
    });
    bookingId = booking.id;
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return NextResponse.json({ error: err.message, conflict: true }, { status: 409 });
    }
    console.error("[bookings] createHold", err);
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }

  const endTime = endTimeFor(input.startTime, input.durationHours);

  // 2a. Payments configured → hand off to the provider's hosted checkout.
  if (isPaymentConfigured()) {
    try {
      const provider = getPaymentProvider();
      const session = await provider.createCheckoutSession({
        bookingId,
        customerEmail: input.customer.email,
        lineItems: [
          {
            name: `${studioName(slug)} — ${input.durationHours}h`,
            description: `${input.date} · ${input.startTime}–${endTime}`,
            amount: Math.round(total * 100),
            currency,
            quantity: 1,
          },
        ],
        successUrl: `${origin}/booking/confirmation?booking=${bookingId}`,
        cancelUrl: `${origin}/?booking=cancelled#booking`,
        metadata: { bookingId, studio: slug, date: input.date, startTime: input.startTime },
      });
      return NextResponse.json({ bookingId, checkoutUrl: session.url });
    } catch (err) {
      console.error("[bookings] checkout", err);
      return NextResponse.json({ error: "Could not start payment" }, { status: 502 });
    }
  }

  // 2b. No payment provider → confirm immediately (demo / manual-payment mode).
  try {
    await markBookingPaid(bookingId, { provider: "manual", reference: "manual" });
    await sendBookingConfirmation({
      to: input.customer.email,
      bookingId,
      studioName: studioName(slug),
      date: input.date,
      startTime: input.startTime,
      endTime,
      durationHours: input.durationHours,
      totalPaid: `${site.booking.currencySymbol}${total.toFixed(0)}`,
    });
  } catch (err) {
    console.error("[bookings] manual confirm", err);
  }
  return NextResponse.json({
    bookingId,
    confirmationUrl: `/booking/confirmation?booking=${bookingId}`,
    paymentSkipped: true,
  });
}
