"use server";

import { checkAdminPassword, clearAdminCookie, setAdminCookie } from "@/lib/admin-auth";

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
