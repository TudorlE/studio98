"use server";

import { revalidatePath } from "next/cache";
import { checkAdminPassword, clearAdminCookie, isAdminAuthed, setAdminCookie } from "@/lib/admin-auth";
import { confirmOnsiteAdvance, deleteBooking, deletePayment, recordPayment } from "@/lib/server/bookings";

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
