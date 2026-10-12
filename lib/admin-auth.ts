import "server-only";
import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "studio98_admin";

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

/** Cookie holds a hash of the password, never the password itself. */
function expectedCookieValue(): string | null {
  const pw = adminPassword();
  if (!pw) return null;
  return createHash("sha256").update(pw).digest("hex");
}

export function checkAdminPassword(input: string): boolean {
  const pw = adminPassword();
  if (!pw) return false;
  // Trim stray whitespace/newlines from a copy-paste, but compare case-sensitively.
  const a = Buffer.from(input.trim());
  const b = Buffer.from(pw.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function setAdminCookie(): Promise<void> {
  const value = expectedCookieValue();
  if (!value) return;
  const store = await cookies();
  store.set(ADMIN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdminAuthed(): Promise<boolean> {
  const expected = expectedCookieValue();
  if (!expected) return false;
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value === expected;
}
