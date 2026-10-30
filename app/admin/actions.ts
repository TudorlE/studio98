"use server";

import { revalidatePath } from "next/cache";
import { checkAdminPassword, clearAdminCookie, isAdminAuthed, setAdminCookie } from "@/lib/admin-auth";
import {
  confirmOnsiteAdvance,
  deleteBooking,
  deletePayment,
  recordPayment,
  syncUpcomingToCalendar,
} from "@/lib/server/bookings";
import { blockHour, blockWholeDay, unblockHour, unblockWholeDay } from "@/lib/server/blackouts";
import type { StudioSlug } from "@/lib/studios";

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    return { error: "Parolă greșită." };
  }
  await setAdminCookie();
  return { error: null };
}

export async function logout(): Promise<void> {
  await clearAdminCookie();
}

export async function confirmAdvance(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const id = String(formData.get("bookingId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  if (!id) return;
  await confirmOnsiteAdvance(id, amount);
  revalidatePath("/admin");
}

export async function removeBooking(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const id = String(formData.get("bookingId") ?? "");
  if (!id) return;
  await deleteBooking(id);
  revalidatePath("/admin");
}

/** Money taken at the studio (cash/card on the day) — logged with today's date. */
export async function recordStudioPayment(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const id = String(formData.get("bookingId") ?? "");
  const amount = Number(formData.get("amount") ?? 0);
  if (!id || !(amount > 0)) return;
  await recordPayment(id, amount, "studio");
  revalidatePath("/admin");
}

export async function removePayment(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const id = String(formData.get("paymentId") ?? "");
  if (!id) return;
  await deletePayment(id);
  revalidatePath("/admin");
}

/** Toggles one hour: blocks it if free, unblocks it if already blocked by an admin. */
export async function toggleHour(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const studio = String(formData.get("studio") ?? "") as StudioSlug;
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const blocked = formData.get("blocked") === "1";
  if (!studio || !date || !time) return;
  if (blocked) await unblockHour(studio, date, time);
  else await blockHour(studio, date, time);
  revalidatePath("/admin");
}

export async function toggleWholeDay(formData: FormData): Promise<void> {
  if (!(await isAdminAuthed())) return;
  const studio = String(formData.get("studio") ?? "") as StudioSlug;
  const date = String(formData.get("date") ?? "");
  const wholeDayId = String(formData.get("wholeDayId") ?? "");
  if (!studio || !date) return;
  if (wholeDayId) await unblockWholeDay(wholeDayId);
  else await blockWholeDay(studio, date);
  revalidatePath("/admin");
}

export type CalendarSyncState = { message: string | null };

/** Push every upcoming confirmed booking to Google Calendar. */
export async function syncCalendar(): Promise<CalendarSyncState> {
  if (!(await isAdminAuthed())) return { message: null };
  try {
    const n = await syncUpcomingToCalendar();
    return { message: n === 1 ? "1 rezervare sincronizată" : `${n} rezervări sincronizate` };
  } catch (err) {
    console.error("[calendar] sync all", err);
    return { message: "Eroare — verifică setările Google Calendar" };
  }
}
