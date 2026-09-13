import { NextRequest, NextResponse } from "next/server";
import { monthAvailabilityQuerySchema } from "@/lib/validation";
import { generateDaySlots } from "@/lib/booking";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getMonthBookingCounts } from "@/lib/server/bookings";
import type { StudioSlug } from "@/lib/studios";

export const dynamic = "force-dynamic";

/** Per-day status for one month, so the calendar can flag busy/full days. */
export async function GET(req: NextRequest) {
  const parsed = monthAvailabilityQuerySchema.safeParse({
    studio: req.nextUrl.searchParams.get("studio"),
    year: req.nextUrl.searchParams.get("year"),
    month: req.nextUrl.searchParams.get("month"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { studio, year, month } = parsed.data;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ configured: false, status: {} });
  }

  try {
    const counts = await getMonthBookingCounts(studio as StudioSlug, year, month);
    const totalSlots = generateDaySlots().length;
    const status: Record<string, "busy" | "full"> = {};
    for (const [date, count] of Object.entries(counts)) {
      status[date] = count >= totalSlots ? "full" : "busy";
    }
    return NextResponse.json({ configured: true, status });
  } catch (err) {
    console.error("[availability/month]", err);
    return NextResponse.json({ error: "Could not load availability" }, { status: 500 });
  }
}
