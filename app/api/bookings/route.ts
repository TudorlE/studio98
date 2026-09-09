import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validation";
import { endTimeFor, formatMoney } from "@/lib/booking";
import { site } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  createHold,
  markBookingPaid,
  BookingConflictError,
  BookingRequestError,
  studioName,
} from "@/lib/server/bookings";
import { getPaymentProvider, isPaymentConfigured } from "@/lib/payments";
import { sendBookingConfirmation } from "@/lib/email";
import type { CheckoutLineItem } from "@/lib/payments/provider";
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
  const currency = site.booking.currency;
  const origin = req.nextUrl.origin;
  const endTime = endTimeFor(input.startTime, input.durationHours);

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

  // 1. Create the hold + compute the authoritative price server-side.
  let bookingId: string;
  let breakdown;
  try {
    const held = await createHold({
      slug,
      date: input.date,
      startTime: input.startTime,
      durationHours: input.durationHours,
      addOnIds: input.addOnIds,
      currency,
      customer: input.customer,
    });
    bookingId = held.booking.id;
    breakdown = held.breakdown;
  } catch (err) {
    if (err instanceof BookingConflictError) {
      return NextResponse.json({ error: err.message, conflict: true }, { status: 409 });
    }
    if (err instanceof BookingRequestError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    console.error("[bookings] createHold", err);
    return NextResponse.json({ error: "Could not create booking" }, { status: 500 });
  }

  // 2a. Payments configured → hosted checkout.
  if (isPaymentConfigured()) {
    try {
      const provider = getPaymentProvider();

      const lineItems: CheckoutLineItem[] =
        breakdown.depositPercent >= 100
          ? [breakdown.studioLine, ...breakdown.addOnLines].map((l) => ({
              name: `${studioName(slug)} — ${l.label}`,
              description: `${input.date} · ${input.startTime}–${endTime}`,
              amount: Math.round(l.amount * 100),
              currency,
              quantity: 1,
            }))
          : [
              {
                name: `${studioName(slug)} — deposit (${breakdown.depositPercent}%)`,
                description: `${input.date} · ${input.startTime}–${endTime} · balance ${formatMoney(
                  breakdown.dueAtStudio,
                )} at the studio`,
                amount: Math.round(breakdown.dueNow * 100),
                currency,
                quantity: 1,
              },
            ];

      const session = await provider.createCheckoutSession({
        bookingId,
        customerEmail: input.customer.email,
        lineItems,
        successUrl: `${origin}/booking/confirmation?booking=${bookingId}`,
        cancelUrl: `${origin}/?booking=cancelled`,
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
    await markBookingPaid(bookingId, {
      provider: "manual",
      reference: "manual",
      amountPaid: breakdown.dueNow,
    });
    await sendBookingConfirmation({
      to: input.customer.email,
      bookingId,
      studioName: studioName(slug),
      date: input.date,
      startTime: input.startTime,
      endTime,
      durationHours: input.durationHours,
      addOns: breakdown.addOnLines.map((l) => l.label),
      totalPaid: formatMoney(breakdown.dueNow),
      balanceDue: breakdown.dueAtStudio > 0 ? formatMoney(breakdown.dueAtStudio) : null,
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
