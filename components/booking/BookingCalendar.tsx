"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";
import { addDays, localDateString } from "@/lib/booking";

const DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BookingCalendar({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (date: string) => void;
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const maxDate = useMemo(
    () => addDays(today, site.booking.maxAdvanceDays),
    [today],
  );

  const [view, setView] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const grid = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(view.getFullYear(), view.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [view]);

  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = view < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  const shift = (delta: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-serif text-xl tracking-tight">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shift(-1)}
            disabled={!canPrev}
            aria-label="Previous month"
            className="grid h-9 w-9 place-items-center border border-line disabled:opacity-30 hover:enabled:bg-ink hover:enabled:text-paper"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => shift(1)}
            disabled={!canNext}
            aria-label="Next month"
            className="grid h-9 w-9 place-items-center border border-line disabled:opacity-30 hover:enabled:bg-ink hover:enabled:text-paper"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1 text-center">
        {DOW.map((d) => (
          <span key={d} className="pb-2 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
            {d}
          </span>
        ))}
        {grid.map((date, i) => {
          if (!date) return <span key={`e${i}`} />;
          const iso = localDateString(date);
          const disabled = date < today || date > maxDate;
          const selected = iso === value;
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => onChange(iso)}
              className={cn(
                "aspect-square text-sm transition-colors",
                disabled && "text-ink-faint/50",
                !disabled && !selected && "hover:bg-paper-deep",
                selected && "bg-ink text-paper",
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
