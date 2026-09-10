"use client";

import { cn } from "@/lib/cn";
import { generateDaySlots, type SlotStatus } from "@/lib/booking";

export function TimeSlots({
  statuses,
  value,
  onChange,
  loading,
}: {
  statuses: Record<string, SlotStatus> | null;
  value: string | null;
  onChange: (time: string) => void;
  loading: boolean;
}) {
  const slots = generateDaySlots();

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {slots.map((s) => (
          <div key={s.time} className="h-11 animate-pulse bg-paper-deep" />
        ))}
      </div>
    );
  }

  if (!statuses) return null;

  const anyAvailable = Object.values(statuses).some((v) => v === "available");

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-6">
        {slots.map((s) => {
          const status = statuses[s.time] ?? "closed";
          const selectable = status === "available";
          const selected = value === s.time;
          return (
            <button
              key={s.time}
              type="button"
              disabled={!selectable}
              onClick={() => onChange(s.time)}
              aria-pressed={selected}
              className={cn(
                "flex h-11 items-center justify-center border text-sm transition-colors",
                selected && "border-ink bg-ink text-paper",
                !selected && selectable && "border-line hover:border-ink",
                !selectable && "border-line/60 text-ink-faint line-through",
              )}
              title={
                status === "booked"
                  ? "Booked"
                  : status === "past"
                    ? "Too late to book"
                    : status === "closed"
                      ? "Outside opening hours for this duration"
                      : "Available"
              }
            >
              {s.time}
            </button>
          );
        })}
      </div>
      {!anyAvailable && (
        <p className="mt-4 text-sm text-ink-soft">
          No slots left for this date and duration. Try another day or a shorter session.
        </p>
      )}
    </div>
  );
}
