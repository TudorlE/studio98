import { NextRequest, NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/validation";
import { formatMoney, onsiteAdvance, sessionEndTime } from "@/lib/booking";
import { site } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import {
  createHold,
  markBookingFailed,
  markBookingOnsite,
  BookingConflictError,
  BookingRequestError,
  studioName,
  type HoldResult,
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
    return NextResponse.json({ error: "JSON invalid" }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Te rugăm verifică formularul.", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const slug = input.studio as StudioSlug;
  const currency = site.booking.currency;
  const origin = req.nextUrl.origin;
  // What the client sees: the booked slot ends on the hour, but they leave 5 min before.
  const endTime = sessionEndTime(input.startTime, input.durationHours);
  const dates = [...new Set(input.dates)].sort();

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        error:
          "Sistemul de rezervări nu este configurat încă. Adaugă datele Supabase pentru a activa rezervările reale.",
        demo: true,
      },
      { status: 503 },
    );
  }

  // 1. Hold every date — one row each, same studio/time. If any date fails,
  // release the ones that already succeeded so nothing is left half-booked.
  const held: HoldResult[] = [];
  for (const date of dates) {
    try {
      const hold = await createHold({
        slug,
        date,
        startTime: input.startTime,
        durationHours: input.durationHours,
        addOnIds: input.addOnIds,
        currency,
        customer: input.customer,
      });
      held.push(hold);
    } catch (err) {
      await Promise.allSettled(held.map((h) => markBookingFailed(h.booking.id)));
      if (err instanceof BookingConflictError) {
        return NextResponse.json(
          { error: `${date}: ${err.message}`, conflict: true },
          { status: 409 },
        );
      }
      if (err instanceof BookingRequestError) {
        return NextResponse.json({ error: `${date}: ${err.message}` }, { status: 422 });
      }
      console.error("[bookings] createHold", err);
      return NextResponse.json({ error: "Rezervarea nu a putut fi creată" }, { status: 500 });
    }
  }

  const bookingIds = held.map((h) => h.booking.id);
  const total = held.reduce((sum, h) => sum + h.breakdown.subtotal, 0);
  const dateLabel = dates.length > 1 ? dates.join(", ") : dates[0];

  // 2a. Pay the full amount via MIA, right now — held until the admin
  // confirms it arrived (MIA Business' static QR has no live webhook, so
  // this always needs a human to confirm, unlike Stripe below).
  if (input.paymentMethod === "mia") {
    try {
      await Promise.all(
        bookingIds.map((id) => markBookingOnsite(id, { provider: "mia_full", confirm: false })),
      );
    } catch (err) {
      console.error("[bookings] mia", err);
      await Promise.allSettled(bookingIds.map((id) => markBookingFailed(id)));
      return NextResponse.json({ error: "Rezervarea nu a putut fi creată" }, { status: 500 });
    }
    try {
      await sendBookingConfirmation({
        to: input.customer.email,
        bookingId: bookingIds.join(", "),
        studioName: studioName(slug),
        date: dateLabel,
        startTime: input.startTime,
        endTime,
        durationHours: input.durationHours,
        totalPaid: formatMoney(0),
        onsite: { total: formatMoney(total), advance: formatMoney(total) },
      });
    } catch (err) {
      console.error("[bookings] mia email", err);
    }
    return NextResponse.json({
      bookingId: bookingIds[0],
      confirmationUrl: `/booking/confirmation?booking=${bookingIds.join(",")}`,
    });
  }

  // 2b. Pay at the studio — MIA is still offered (optional for short
  // bookings, required as an advance for long ones). Long bookings stay on
  // hold until the advance arrives (the admin confirms it); short ones are
  // confirmed right away, with MIA still available if the client wants to
  // pay ahead.
  if (input.paymentMethod === "onsite") {
    const advance = onsiteAdvance(input.durationHours, total);
    try {
      await Promise.all(
        bookingIds.map((id) => markBookingOnsite(id, { provider: "mia", confirm: advance === 0 })),
      );
    } catch (err) {
      console.error("[bookings] onsite", err);
      await Promise.allSettled(bookingIds.map((id) => markBookingFailed(id)));
      return NextResponse.json({ error: "Rezervarea nu a putut fi creată" }, { status: 500 });
    }
    try {
      await sendBookingConfirmation({
        to: input.customer.email,
        bookingId: bookingIds.join(", "),
        studioName: studioName(slug),
        date: dateLabel,
        startTime: input.startTime,
        endTime,
        durationHours: input.durationHours,
        totalPaid: formatMoney(0),
        onsite: { total: formatMoney(total), advance: advance > 0 ? formatMoney(advance) : null },
      });
    } catch (err) {
      console.error("[bookings] onsite email", err);
    }
    return NextResponse.json({
      bookingId: bookingIds[0],
      confirmationUrl: `/booking/confirmation?booking=${bookingIds.join(",")}`,
    });
  }

  // 2c. Pay online, by card — one hosted Stripe checkout, one line item per date.
  if (!isPaymentConfigured()) {
    await Promise.allSettled(bookingIds.map((id) => markBookingFailed(id)));
    return NextResponse.json(
      { error: "Plata cu cardul nu este configurată încă. Alege „La studio” sau încearcă mai târziu." },
      { status: 503 },
    );
  }
  try {
    const provider = getPaymentProvider();

    const lineItems: CheckoutLineItem[] = held.flatMap((h, i) =>
      [h.breakdown.studioLine, ...h.breakdown.addOnLines].map((l) => ({
        name: `${studioName(slug)} — ${dates[i]}`,
        description: `${l.label} · ${input.startTime}–${endTime}`,
        amount: Math.round(l.amount * 100),
        currency,
        quantity: 1,
      })),
    );

    const session = await provider.createCheckoutSession({
      bookingId: bookingIds[0],
      customerEmail: input.customer.email,
      lineItems,
      successUrl: `${origin}/booking/confirmation?booking=${bookingIds.join(",")}`,
      cancelUrl: `${origin}/?booking=cancelled`,
      metadata: {
        bookingIds: bookingIds.join(","),
        studio: slug,
        dates: dates.join(","),
        startTime: input.startTime,
      },
    });
    return NextResponse.json({ bookingId: bookingIds[0], checkoutUrl: session.url });
  } catch (err) {
    console.error("[bookings] checkout", err);
    await Promise.allSettled(bookingIds.map((id) => markBookingFailed(id)));
    return NextResponse.json({ error: "Plata nu a putut fi inițiată" }, { status: 502 });
  }
}
