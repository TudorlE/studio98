"use client";

import { cn } from "@/lib/cn";
import { generateDaySlots, formatMoney, type SlotStatus } from "@/lib/booking";

export function TimeSlots({
  statuses,
  value,
  onChange,
  loading,
  price,
}: {
  statuses: Record<string, SlotStatus> | null;
  value: string | null;
  onChange: (time: string) => void;
  loading: boolean;
  /** Price for one hour at this rate — shown under every slot. */
  price: number;
}) {
  const slots = generateDaySlots();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((s) => (
          <div key={s.time} className="h-14 animate-pulse bg-paper-deep" />
        ))}
      </div>
    );
  }

  if (!statuses) return null;

  const anyAvailable = Object.values(statuses).some((v) => v === "available");

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
                "flex h-14 flex-col items-center justify-center border transition-colors",
                selected && "border-ink bg-ink text-paper",
                !selected && selectable && "border-line hover:border-ink",
                !selectable && "border-line/60 text-ink-faint",
              )}
              title={
                status === "booked"
                  ? "Already booked"
                  : status === "past"
                    ? "Too late to book"
                    : status === "closed"
                      ? "Outside opening hours"
                      : "Available"
              }
            >
              <span className={cn("text-sm", !selectable && "line-through")}>{s.time}</span>
              <span className={cn("text-xs opacity-70", selected && "opacity-90")}>
                {selectable ? formatMoney(price) : "—"}
              </span>
            </button>
          );
        })}
      </div>
      {!anyAvailable && (
        <p className="mt-4 text-sm text-ink-soft">
          No free times on this day. Try a different day.
        </p>
      )}
    </div>
  );
}
