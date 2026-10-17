import "server-only";
import { createSign } from "node:crypto";

/**
 * Minimal Google Calendar client using a service account (no SDK).
 *
 * Setup: create a service account in Google Cloud, enable the Calendar API,
 * and share the studio calendar with the service account's email
 * ("Make changes to events"). Env:
 *   GOOGLE_CALENDAR_ID            — the calendar's ID (Settings → Integrate calendar)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL  — …@….iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY            — the key's "private_key" (literal \n are fine)
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API = "https://www.googleapis.com/calendar/v3";

export function isCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY,
  );
}

let token: { value: string; expires: number } | null = null;

const b64url = (s: string | Buffer) => Buffer.from(s).toString("base64url");

async function accessToken(): Promise<string> {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: "https://www.googleapis.com/auth/calendar.events",
      aud: TOKEN_URL,
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(key).toString("base64url");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  token = { value: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return token.value;
}

async function call(method: string, path: string, body?: unknown): Promise<Response> {
  const calendar = encodeURIComponent(process.env.GOOGLE_CALENDAR_ID as string);
  return fetch(`${API}/calendars/${calendar}/events${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${await accessToken()}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/** Stable event ID per booking (Google allows base32hex: 0-9 a-v), so no ID needs storing. */
export const eventIdFor = (bookingId: string) => `s98${bookingId.replace(/-/g, "").toLowerCase()}`;

export type CalendarEvent = {
  summary: string;
  description: string;
  location: string;
  start: string; // local "YYYY-MM-DDTHH:MM:SS"
  end: string;
  timeZone: string;
  colorId?: string;
};

/** Create or update (also restores a previously deleted one). */
export async function upsertEvent(bookingId: string, e: CalendarEvent): Promise<void> {
  const id = eventIdFor(bookingId);
  const body = {
    id,
    status: "confirmed",
    summary: e.summary,
    description: e.description,
    location: e.location,
    colorId: e.colorId,
    start: { dateTime: e.start, timeZone: e.timeZone },
    end: { dateTime: e.end, timeZone: e.timeZone },
  };
  let res = await call("PUT", `/${id}`, body);
  if (res.status === 404) res = await call("POST", "", body);
  if (!res.ok) throw new Error(`Google Calendar upsert ${res.status}: ${await res.text()}`);
}

export async function deleteEvent(bookingId: string): Promise<void> {
  const res = await call("DELETE", `/${eventIdFor(bookingId)}`);
  // 404/410: never synced or already gone — nothing to do.
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Google Calendar delete ${res.status}: ${await res.text()}`);
  }
}
