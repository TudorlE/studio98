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
import { sendBookingConfirmation } from "@/lib/email";
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

  // 2a. Pay the full amount via MIA, right now — held until the admin
  // confirms it arrived (MIA Business' static QR has no live webhook, so
  // this always needs a human to confirm).
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
        customerName: input.customer.name,
        customerPhone: input.customer.phone,
        studioName: studioName(slug),
        dates,
        startTime: input.startTime,
        endTime,
        durationHours: input.durationHours,
        payment: { kind: "mia_full", total: formatMoney(total) },
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
      customerName: input.customer.name,
      customerPhone: input.customer.phone,
      studioName: studioName(slug),
      dates,
      startTime: input.startTime,
      endTime,
      durationHours: input.durationHours,
      payment:
        advance > 0
          ? {
              kind: "mia_advance",
              total: formatMoney(total),
              advance: formatMoney(advance),
              balance: formatMoney(total - advance),
            }
          : { kind: "onsite", total: formatMoney(total) },
    });
  } catch (err) {
    console.error("[bookings] onsite email", err);
  }
  return NextResponse.json({
    bookingId: bookingIds[0],
    confirmationUrl: `/booking/confirmation?booking=${bookingIds.join(",")}`,
  });
}
