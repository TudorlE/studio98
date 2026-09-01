import { NextRequest, NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/lib/validation";
import { computeSlotStatuses } from "@/lib/booking";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getAvailability } from "@/lib/server/bookings";
import type { StudioSlug } from "@/lib/studios";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const parsed = availabilityQuerySchema.safeParse({
    studio: req.nextUrl.searchParams.get("studio"),
    date: req.nextUrl.searchParams.get("date"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const { studio, date } = parsed.data;
  const durationHours = Number(req.nextUrl.searchParams.get("duration") ?? "1") || 1;

  try {
    if (!isSupabaseConfigured()) {
      // Demo mode: nothing is booked yet.
      return NextResponse.json({
        configured: false,
        date,
        slots: computeSlotStatuses({ date, durationHours, bookedRanges: [] }),
      });
    }

    const slots = await getAvailability(studio as StudioSlug, date, durationHours);
    return NextResponse.json({ configured: true, date, slots });
  } catch (err) {
    console.error("[availability]", err);
    return NextResponse.json({ error: "Could not load availability" }, { status: 500 });
  }
}
