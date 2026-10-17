import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { site } from "@/lib/site";
import { studios, addOnById, type StudioSlug } from "@/lib/studios";
import {
  timeToMinutes,
  endTimeFor,
  computeSlotStatuses,
  localDateString,
  minHoursForDate,
  priceBreakdown,
} from "@/lib/booking";
import type { BookingRow, BookingAddOn, PaymentMethod, PaymentRow } from "@/lib/supabase/types";

/** The slot is taken (or the date has passed). The API route words it per language. */
export class BookingConflictError extends Error {
  constructor(readonly reason: "taken" | "past" = "taken") {
    super(reason === "past" ? "Date has passed" : "Slot no longer available");
    this.name = "BookingConflictError";
  }
}

/** The date needs a longer booking than requested. */
export class BookingRequestError extends Error {
  constructor(readonly minHours: number) {
    super(`Minimum booking is ${minHours}h`);
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
  await purgeExpiredHolds();
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

/**
 * MIA bookings sit on `hold` until the admin confirms the transfer. A hold
 * older than `miaHoldMinutes` counts as unpaid and is deleted, freeing the
 * slot. Runs lazily before every availability / admin read — no cron needed.
 */
export async function purgeExpiredHolds(): Promise<void> {
  const db = getSupabaseAdmin();
  const cutoff = new Date(Date.now() - site.booking.miaHoldMinutes * 60_000).toISOString();
  const { error } = await db
    .from("bookings")
    .delete()
    .eq("booking_status", "hold")
    .lt("created_at", cutoff);
  if (error) throw error;
}

export async function getAvailability(slug: StudioSlug, date: string, durationHours: number) {
  const bookedRanges = await getBookedRanges(slug, date);
  return computeSlotStatuses({ date, durationHours, bookedRanges });
}

/** How many active bookings each date in a month has, for the calendar's "busy" markers. */
export async function getMonthBookingCounts(
  slug: StudioSlug,
  year: number,
  month: number, // 1-12
): Promise<Record<string, number>> {
  await purgeExpiredHolds();
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;

  const { data, error } = await db
    .from("bookings")
    .select("date")
    .eq("studio_id", studioId)
    .gte("date", start)
    .lte("date", end)
    .in("booking_status", ["hold", "confirmed"]);
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.date] = (counts[row.date] ?? 0) + 1;
  }
  return counts;
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
    throw new BookingConflictError("past");
  }

  const minHours = minHoursForDate(input.slug, input.date);
  if (input.durationHours < minHours) {
    throw new BookingRequestError(minHours);
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

/**
 * Pay-at-studio bookings. `provider` is "onsite" (confirmed now, everything paid
 * at the studio), "mia" (slot held until the admin receives the MIA advance for
 * a long booking), or "mia_full" (client chose to pay the whole thing via MIA
 * right now — also held until the admin confirms it arrived).
 */
export async function markBookingOnsite(
  id: string,
  opts: { provider: "onsite" | "mia" | "mia_full"; confirm: boolean },
): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db
    .from("bookings")
    .update({
      payment_provider: opts.provider,
      booking_status: opts.confirm ? "confirmed" : "hold",
    })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Admin confirms a MIA advance arrived — releases the hold and records how
 * much was actually received. The rest stays due at the studio.
 */
export async function confirmOnsiteAdvance(id: string, advanceAmount: number): Promise<void> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("bookings")
    .update({ booking_status: "confirmed", deposit_paid: advanceAmount })
    .eq("id", id)
    .eq("booking_status", "hold")
    .select("id");
  if (error) throw error;
  if (data?.length && advanceAmount > 0) await recordPayment(id, advanceAmount, "mia");
}

// ---------------------------------------------------------------------------
// Payments ledger (supabase/migrations/0002_payments.sql)
// ---------------------------------------------------------------------------

/** Postgres "relation does not exist" — the payments migration hasn't been run yet. */
const isMissingTable = (err: { code?: string } | null) => err?.code === "42P01" || err?.code === "PGRST205";

/**
 * Log money received for a booking, then sync the booking's running total:
 * `deposit_paid` = everything received, and `payment_status` = paid once it covers the price.
 */
export async function recordPayment(bookingId: string, amount: number, method: PaymentMethod): Promise<void> {
  const db = getSupabaseAdmin();
  const { data: booking, error: readErr } = await db
    .from("bookings")
    .select("*, studios(slug)")
    .eq("id", bookingId)
    .maybeSingle();
  if (readErr) throw readErr;
  if (!booking) return;
  const b = booking as BookingRow & { studios: { slug: string } | null };

  const { error: insertErr } = await db.from("payments").insert({
    booking_id: b.id,
    amount,
    method,
    customer_name: b.customer_name,
    customer_email: b.customer_email,
    customer_phone: b.customer_phone,
    studio_name: b.studios ? studioName(b.studios.slug as StudioSlug) : null,
    booking_date: b.date,
    booking_start: b.start_time,
  });
  if (insertErr) {
    // Before the migration runs, keep confirming bookings — just without the ledger row.
    if (isMissingTable(insertErr)) return console.warn("[payments] table missing — run 0002_payments.sql");
    throw insertErr;
  }
  await syncBookingPaid(b.id, Number(b.total_price));
}

async function syncBookingPaid(bookingId: string, total: number): Promise<void> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("payments").select("amount").eq("booking_id", bookingId);
  if (error) throw error;
  const received = (data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const { error: updErr } = await db
    .from("bookings")
    .update({
      deposit_paid: received,
      payment_status: received >= total && total > 0 ? "paid" : "pending",
    })
    .eq("id", bookingId);
  if (updErr) throw updErr;
}

/** Admin: remove a payment entered by mistake. */
export async function deletePayment(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("payments").delete().eq("id", id).select("booking_id");
  if (error) throw error;
  const bookingId = data?.[0]?.booking_id as string | null | undefined;
  if (!bookingId) return;
  const { data: booking } = await db.from("bookings").select("total_price").eq("id", bookingId).maybeSingle();
  if (booking) await syncBookingPaid(bookingId, Number(booking.total_price));
}

/** Every payment, newest first, or null when the payments table doesn't exist yet. */
export async function listPayments(): Promise<PaymentRow[] | null> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("payments").select("*").order("paid_at", { ascending: false });
  if (error) {
    if (isMissingTable(error)) return null;
    throw error;
  }
  return (data ?? []) as PaymentRow[];
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

/** Client-facing studio name, e.g. "Production Studio" / "The Apartment". */
/** Admin: permanently remove a booking (any status). */
export async function deleteBooking(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("bookings").delete().eq("id", id);
  if (error) throw error;
}

export function studioName(slug: StudioSlug): string {
  const studio = studios.find((s) => s.slug === slug);
  if (!studio) return slug;
  return studio.subtitle
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export type AdminBookingRow = BookingRow & { studio_name: string; studio_slug: string };

/** Every booking, newest first — for the admin panel. */
export async function listBookings(): Promise<AdminBookingRow[]> {
  await purgeExpiredHolds();
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from("bookings")
    .select("*, studios(name, slug)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const { studios: studio, ...rest } = row as BookingRow & {
      studios: { name: string; slug: string } | null;
    };
    return {
      ...rest,
      studio_name: studio ? studioName(studio.slug as StudioSlug) : "—",
      studio_slug: studio?.slug ?? "",
    };
  });
}
