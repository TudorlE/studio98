import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { studios, type StudioSlug } from "@/lib/studios";
import { generateDaySlots, minutesToTime, rangesOverlap, timeToMinutes } from "@/lib/booking";
import type { BlackoutRow } from "@/lib/supabase/types";

function studioIdForSlug(slug: StudioSlug): string {
  const s = studios.find((x) => x.slug === slug);
  if (!s) throw new Error(`Unknown studio slug: ${slug}`);
  return s.id;
}

export type HourState = "available" | "booked" | "blocked";

/**
 * Per-hour state for one studio+day — free, taken by a real booking (left
 * alone), or blocked by the admin (safe to toggle). Also tells the caller
 * whether the whole day is blocked with a single row.
 */
export async function getDaySchedule(
  slug: StudioSlug,
  date: string,
): Promise<{ hours: Record<string, HourState>; wholeDay: BlackoutRow | null }> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);

  const [{ data: bookings, error: bErr }, { data: rows, error: xErr }] = await Promise.all([
    db
      .from("bookings")
      .select("start_time,end_time")
      .eq("studio_id", studioId)
      .eq("date", date)
      .in("booking_status", ["hold", "confirmed"]),
    db.from("blackouts").select("*").eq("date", date).or(`studio_id.eq.${studioId},studio_id.is.null`),
  ]);
  if (bErr) throw bErr;
  if (xErr) throw xErr;

  const blackouts = (rows ?? []) as BlackoutRow[];
  const wholeDay = blackouts.find((x) => !x.start_time) ?? null;

  const bookedRanges = (bookings ?? []).map((b) => ({
    start: timeToMinutes(b.start_time),
    end: timeToMinutes(b.end_time),
  }));
  const blockedRanges = blackouts
    .filter((x): x is BlackoutRow & { start_time: string; end_time: string } => Boolean(x.start_time && x.end_time))
    .map((x) => ({ start: timeToMinutes(x.start_time), end: timeToMinutes(x.end_time) }));

  const hours: Record<string, HourState> = {};
  for (const slot of generateDaySlots()) {
    const start = slot.minutes;
    const end = start + 60;
    if (wholeDay || blockedRanges.some((r) => rangesOverlap(start, end, r.start, r.end))) {
      hours[slot.time] = "blocked";
    } else if (bookedRanges.some((r) => rangesOverlap(start, end, r.start, r.end))) {
      hours[slot.time] = "booked";
    } else {
      hours[slot.time] = "available";
    }
  }
  return { hours, wholeDay };
}

/** Admin blocks one free hour — one row, so unblocking later is a single delete. */
export async function blockHour(slug: StudioSlug, date: string, startTime: string): Promise<void> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);
  const endTime = minutesToTime(timeToMinutes(startTime) + 60);
  const { error } = await db
    .from("blackouts")
    .insert({ studio_id: studioId, date, start_time: startTime, end_time: endTime, reason: "Blocat din admin" });
  if (error) throw error;
}

/** Deletes whichever blackout row(s) cover this hour (handles a wider range someone blocked earlier). */
export async function unblockHour(slug: StudioSlug, date: string, startTime: string): Promise<void> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);
  const start = timeToMinutes(startTime);
  const end = start + 60;
  const { data, error } = await db
    .from("blackouts")
    .select("id,start_time,end_time")
    .eq("date", date)
    .or(`studio_id.eq.${studioId},studio_id.is.null`);
  if (error) throw error;
  const toDelete = (data ?? []).filter(
    (x) => x.start_time && x.end_time && rangesOverlap(start, end, timeToMinutes(x.start_time), timeToMinutes(x.end_time)),
  );
  if (toDelete.length === 0) return;
  const { error: delErr } = await db
    .from("blackouts")
    .delete()
    .in("id", toDelete.map((x) => x.id));
  if (delErr) throw delErr;
}

/** Blocks every hour of the day with a single row — clears any partial blocks first. */
export async function blockWholeDay(slug: StudioSlug, date: string): Promise<void> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);
  await db.from("blackouts").delete().eq("date", date).eq("studio_id", studioId);
  const { error } = await db
    .from("blackouts")
    .insert({ studio_id: studioId, date, start_time: null, end_time: null, reason: "Zi blocată din admin" });
  if (error) throw error;
}

export async function unblockWholeDay(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("blackouts").delete().eq("id", id);
  if (error) throw error;
}

/** Which days this month have any blackout — feeds a small dot on the admin calendar. */
export async function getMonthBlackoutDays(
  slug: StudioSlug,
  year: number,
  month: number,
): Promise<Set<string>> {
  const db = getSupabaseAdmin();
  const studioId = studioIdForSlug(slug);
  const pad = (n: number) => String(n).padStart(2, "0");
  const start = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${pad(month)}-${pad(lastDay)}`;
  const { data, error } = await db
    .from("blackouts")
    .select("date")
    .gte("date", start)
    .lte("date", end)
    .or(`studio_id.eq.${studioId},studio_id.is.null`);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.date as string));
}
