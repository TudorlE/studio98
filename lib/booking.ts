/**
 * Booking domain logic — pure, framework-free, shared by client + server.
 */
import { site } from "@/lib/site";
import { studios, type StudioSlug } from "@/lib/studios";

export type TimeSlot = {
  /** "09:00" */
  time: string;
  /** minutes since midnight */
  minutes: number;
};

export type SlotStatus = "available" | "booked" | "past" | "closed";

export type BookingRange = {
  /** "09:00" inclusive */
  start: string;
  /** "12:00" exclusive */
  end: string;
};

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const minutesToTime = (m: number) => `${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`;

export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
};

/** Every slot the studio could theoretically be booked for on any day. */
export function generateDaySlots(): TimeSlot[] {
  const { openingHour, closingHour, slotMinutes } = site.booking;
  const slots: TimeSlot[] = [];
  for (let m = openingHour * 60; m + slotMinutes <= closingHour * 60; m += slotMinutes) {
    slots.push({ time: minutesToTime(m), minutes: m });
  }
  return slots;
}

export const durationOptions = site.booking.durations;

export function getStudioPrice(slug: StudioSlug): number {
  const s = studios.find((x) => x.slug === slug);
  return s ? s.pricePerHour : 0;
}

export function calcTotal(slug: StudioSlug, durationHours: number): number {
  return getStudioPrice(slug) * durationHours;
}

export function formatMoney(amount: number): string {
  return `${site.booking.currencySymbol}${amount.toFixed(0)}`;
}

/** Two [start,end) ranges in minutes overlap. */
export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Given the set of existing bookings for a studio+date (as minute ranges),
 * decide the status of each start slot for a requested duration.
 */
export function computeSlotStatuses(params: {
  date: string; // YYYY-MM-DD (local)
  durationHours: number;
  bookedRanges: { start: number; end: number }[];
  now?: Date;
}): Record<string, SlotStatus> {
  const { date, durationHours, bookedRanges } = params;
  const now = params.now ?? new Date();
  const { closingHour, minLeadHours } = site.booking;
  const durationMin = durationHours * 60;

  const todayStr = localDateString(now);
  const isToday = date === todayStr;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const leadCutoff = nowMinutes + minLeadHours * 60;

  const result: Record<string, SlotStatus> = {};
  for (const slot of generateDaySlots()) {
    const start = slot.minutes;
    const end = start + durationMin;

    if (end > closingHour * 60) {
      result[slot.time] = "closed";
      continue;
    }
    if (isToday && start < leadCutoff) {
      result[slot.time] = "past";
      continue;
    }
    if (date < todayStr) {
      result[slot.time] = "past";
      continue;
    }
    const clash = bookedRanges.some((r) => rangesOverlap(start, end, r.start, r.end));
    result[slot.time] = clash ? "booked" : "available";
  }
  return result;
}

/** Local YYYY-MM-DD (avoids UTC off-by-one from toISOString). */
export function localDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function addDays(d: Date, days: number): Date {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
}

export function endTimeFor(startTime: string, durationHours: number): string {
  return minutesToTime(timeToMinutes(startTime) + durationHours * 60);
}
