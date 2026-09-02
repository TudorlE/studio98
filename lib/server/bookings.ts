import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { studios, addOnById, type StudioSlug } from "@/lib/studios";
import {
  timeToMinutes,
  endTimeFor,
  computeSlotStatuses,
  localDateString,
  minHoursForDate,
  priceBreakdown,
} from "@/lib/booking";
import type { BookingRow, BookingAddOn } from "@/lib/supabase/types";

export class BookingConflictError extends Error {
  constructor(msg = "That time is no longer available.") {
    super(msg);
    this.name = "BookingConflictError";
  }
}

export class BookingRequestError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "BookingRequestError";
  }
}

function studioIdForSlug(slug: StudioSlug): string {
  const s = studios.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown studio slug: ${slug}`);
  return s.id;
}

/** Active booking ranges (in minutes) for a studio on a date, plus blackouts. */
export async function getBookedRanges(
  slug: StudioSlug,
  date: string,
): Promise<{ start: number; end: number }[]> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);

  const [{ data: bookings, error: bErr }, { data: blackouts, error: xErr }] =
    await Promise.all([
      db
        .from("bookings")
        .select("start_time,end_time,booking_status")
        .eq("studio_id", studioId)
        .eq("date", date)
        .in("booking_status", ["hold", "confirmed"]),
      db
        .from("blackouts")
        .select("start_time,end_time,studio_id")
        .eq("date", date)
        .or(`studio_id.eq.${studioId},studio_id.is.null`),
    ]);

  if (bErr) throw bErr;
  if (xErr) throw xErr;

  const ranges: { start: number; end: number }[] = [];
  for (const b of bookings ?? []) {
    ranges.push({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) });
  }
  for (const x of blackouts ?? []) {
    ranges.push({
      start: x.start_time ? timeToMinutes(x.start_time) : 0,
      end: x.end_time ? timeToMinutes(x.end_time) : 24 * 60,
    });
  }
  return ranges;
}

export async function getAvailability(slug: StudioSlug, date: string, durationHours: number) {
  const bookedRanges = await getBookedRanges(slug, date);
  return computeSlotStatuses({ date, durationHours, bookedRanges });
}

export type CreateHoldInput = {
  slug: StudioSlug;
  date: string;
  startTime: string;
  durationHours: number;
  addOnIds: string[];
  currency: string;
  customer: { name: string; email: string; phone: string };
};

export type HoldResult = {
  booking: BookingRow;
  breakdown: ReturnType<typeof priceBreakdown>;
};

/**
 * Insert a booking in `hold` state. Relies on:
 *  1. request validation (duration min, lead time),
 *  2. an explicit overlap pre-check (fast, friendly error), and
 *  3. a Postgres exclusion constraint (authoritative — prevents the race).
 *
 * The price is always recomputed here — never trusted from the client.
 */
export async function createHold(input: CreateHoldInput): Promise<HoldResult> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(input.slug);
  const endTime = endTimeFor(input.startTime, input.durationHours);

  if (input.date < localDateString(new Date())) {
    throw new BookingConflictError("That date is in the past.");
  }

  const minHours = minHoursForDate(input.slug, input.date);
  if (input.durationHours < minHours) {
    throw new BookingRequestError(
      `This date needs a minimum booking of ${minHours} hour${minHours > 1 ? "s" : ""}.`,
    );
  }

  const existing = await getBookedRanges(input.slug, input.date);
  const start = timeToMinutes(input.startTime);
  const end = timeToMinutes(endTime);
  if (existing.some((r) => start < r.end && r.start < end)) {
    throw new BookingConflictError();
  }

  const breakdown = priceBreakdown({
    slug: input.slug,
    date: input.date,
    durationHours: input.durationHours,
    addOnIds: input.addOnIds,
  });

  const addOns: BookingAddOn[] = input.addOnIds
    .map((id) => addOnById(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({
      id: a.id,
      name: a.name,
      amount: a.unit === "hour" ? a.price * breakdown.hours : a.price,
    }));

  const { data, error } = await db
    .from("bookings")
    .insert({
      studio_id: studioId,
      customer_name: input.customer.name,
      customer_email: input.customer.email,
      customer_phone: input.customer.phone,
      date: input.date,
      start_time: input.startTime,
      end_time: endTime,
      duration: input.durationHours,
      hourly_rate: breakdown.rate,
      total_price: breakdown.subtotal,
      deposit_paid: 0,
      add_ons: addOns,
      currency: input.currency,
      payment_status: "pending",
      booking_status: "hold",
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23P01" || error.code === "23505") {
      throw new BookingConflictError();
    }
    throw error;
  }
  return { booking: data as BookingRow, breakdown };
}

export async function getBooking(id: string): Promise<BookingRow | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as BookingRow) ?? null;
}

export async function markBookingPaid(
  id: string,
  opts: { provider: string; reference: string; amountPaid?: number },
): Promise<BookingRow | null> {
  const db = getSupabaseAdmin();
  const update: Record<string, unknown> = {
    payment_status: "paid",
    booking_status: "confirmed",
    payment_provider: opts.provider,
    payment_reference: opts.reference,
  };
  if (typeof opts.amountPaid === "number") update.deposit_paid = opts.amountPaid;

  const { data, error } = await db
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as BookingRow) ?? null;
}

export async function markBookingFailed(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("bookings")
    .update({ payment_status: "failed", booking_status: "cancelled" })
    .eq("id", id)
    .eq("booking_status", "hold");
  if (error) throw error;
}

export function studioName(slug: StudioSlug): string {
  return studios.find((s) => s.slug === slug)?.name ?? slug;
}
