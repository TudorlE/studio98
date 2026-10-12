import { NextRequest, NextResponse } from "next/server";
import {
  renderBookingConfirmation,
  renderBookingNotification,
  type BookingConfirmationEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * Local preview of the booking emails — /dev/email?kind=mia_full|mia_advance|onsite
 * (add &to=admin for the studio's "new booking" alert).
 * Disabled in production.
 */
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const kind = req.nextUrl.searchParams.get("kind") ?? "mia_full";
  const payment: BookingConfirmationEmail["payment"] =
    kind === "mia_advance"
      ? { kind: "mia_advance", total: "4 800 lei", advance: "2 400 lei", balance: "2 400 lei" }
      : kind === "onsite"
        ? { kind: "onsite", total: "1 600 lei" }
        : { kind: "mia_full", total: "800 lei" };

  const data: BookingConfirmationEmail = {
    to: "client@example.com",
    customerName: "Ana Popescu",
    customerPhone: "+373 69 123 456",
    studioName: "Production Studio",
    dates: ["2026-11-06"],
    startTime: "10:00",
    endTime: kind === "mia_advance" ? "12:55" : kind === "onsite" ? "11:55" : "10:55",
    durationHours: kind === "mia_advance" ? 3 : kind === "onsite" ? 2 : 1,
    payment,
  };
  const { html } =
    req.nextUrl.searchParams.get("to") === "admin"
      ? renderBookingNotification(data)
      : renderBookingConfirmation(data);

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
