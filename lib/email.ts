/**
 * Pluggable transactional email.
 *
 * Uses Resend when RESEND_API_KEY is present, otherwise logs to the server
 * console so local development and the demo build never break.
 */
import { site } from "@/lib/site";

export type BookingConfirmationEmail = {
  to: string;
  bookingId: string;
  studioName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  addOns?: string[];
  totalPaid: string;
  balanceDue?: string | null;
};

export async function sendBookingConfirmation(data: BookingConfirmationEmail): Promise<void> {
  const subject = `Rezervare confirmată — ${data.studioName} · ${data.date}`;
  const text = [
    `Rezervarea ta la ${site.name} este confirmată.`,
    ``,
    `Cod rezervare: ${data.bookingId}`,
    `Studio:        ${data.studioName}`,
    `Data:          ${data.date}`,
    `Ora:           ${data.startTime}–${data.endTime} (${data.durationHours}h)`,
    ...(data.addOns && data.addOns.length ? [`Extra:         ${data.addOns.join(", ")}`] : []),
    `Achitat:       ${data.totalPaid}`,
    ...(data.balanceDue ? [`De achitat la studio: ${data.balanceDue}`] : []),
    ``,
    `Adresă: ${site.contact.address.line1}, ${site.contact.address.line2}`,
    `Întrebări? ${site.contact.email}`,
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "bookings@studio98.example";

  if (!apiKey) {
    console.info("[email] RESEND_API_KEY not set — confirmation not sent:\n", { subject, text });
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: data.to, subject, text }),
  });

  if (!res.ok) {
    console.error("[email] Resend failed", res.status, await res.text());
  }
}
