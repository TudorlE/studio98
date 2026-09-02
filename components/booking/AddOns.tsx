"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { studioAddOns } from "@/lib/studios";
import { formatMoney } from "@/lib/booking";

export function AddOns({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {studioAddOns.map((a) => {
        const on = selected.includes(a.id);
        return (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onToggle(a.id)}
              aria-pressed={on}
              className="flex w-full items-center gap-4 py-4 text-left"
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center border transition-colors",
                  on ? "border-ink bg-ink text-paper" : "border-line",
                )}
              >
                {on && <Check size={13} strokeWidth={2.5} />}
              </span>
              <span className="flex-1">
                <span className="block text-sm">{a.name}</span>
                <span className="block text-xs text-ink-faint">{a.note}</span>
              </span>
              <span className="shrink-0 text-sm text-ink-soft">
                +{formatMoney(a.price)}
                {a.unit === "hour" ? " / h" : ""}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
