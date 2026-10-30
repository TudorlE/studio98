"use client";

import { useOptimistic } from "react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { HourState } from "@/lib/server/blackouts";

const HOUR_STYLE: Record<HourState, string> = {
  available: "border-line hover:border-accent hover:bg-accent/5",
  blocked: "border-ink bg-ink text-paper",
  booked: "border-line bg-neutral-100 text-ink-faint",
};
const HOUR_TAG: Record<HourState, string> = { available: "Liber", blocked: "Blocat", booked: "Rezervat" };

/**
 * Flips to blocked/available the instant you click, instead of waiting on
 * the server-action round trip + revalidate — that gap (a few hundred ms on
 * a slow connection) read as the square not responding to the click.
 */
export function HourToggleButton({
  studio,
  date,
  time,
  state,
  toggleHour,
}: {
  studio: string;
  date: string;
  time: string;
  state: HourState;
  toggleHour: (formData: FormData) => Promise<void>;
}) {
  const [optimisticState, setOptimisticState] = useOptimistic(state);
  const isBooked = optimisticState === "booked";

  async function action(formData: FormData) {
    if (state !== "booked") setOptimisticState(state === "blocked" ? "available" : "blocked");
    await toggleHour(formData);
  }

  return (
    <form action={action}>
      <input type="hidden" name="studio" value={studio} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="time" value={time} />
      <input type="hidden" name="blocked" value={state === "blocked" ? "1" : "0"} />
      <button
        type="submit"
        disabled={isBooked}
        className={cn(
          "flex h-14 w-full flex-col items-center justify-center rounded-2xl border text-sm transition-colors",
          HOUR_STYLE[optimisticState],
          isBooked && "cursor-not-allowed",
        )}
      >
        <span className="font-medium">{time}</span>
        <span className="text-[0.6rem] uppercase tracking-[0.08em] opacity-70">{HOUR_TAG[optimisticState]}</span>
      </button>
    </form>
  );
}

export function WholeDayToggleButton({
  studio,
  date,
  wholeDayId,
  toggleWholeDay,
}: {
  studio: string;
  date: string;
  wholeDayId: string;
  toggleWholeDay: (formData: FormData) => Promise<void>;
}) {
  const [optimisticBlocked, setOptimisticBlocked] = useOptimistic(Boolean(wholeDayId));

  async function action(formData: FormData) {
    setOptimisticBlocked(!optimisticBlocked);
    await toggleWholeDay(formData);
  }

  return (
    <form action={action}>
      <input type="hidden" name="studio" value={studio} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="wholeDayId" value={wholeDayId} />
      <button
        type="submit"
        className={cn(
          "flex h-9 items-center gap-2 rounded-full border px-4 text-[0.65rem] font-medium uppercase tracking-[0.1em] transition-colors",
          optimisticBlocked
            ? "border-ink bg-ink text-paper hover:bg-ink/85"
            : "border-ink/25 hover:bg-ink hover:text-paper",
        )}
      >
        <Lock size={13} />
        {optimisticBlocked ? "Deblochează toată ziua" : "Blochează toată ziua"}
      </button>
    </form>
  );
}
