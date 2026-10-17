"use client";

import { useActionState } from "react";
import { CalendarCheck } from "lucide-react";
import { syncCalendar, type CalendarSyncState } from "./actions";

export function CalendarSyncButton() {
  const [state, action, pending] = useActionState<CalendarSyncState>(syncCalendar, { message: null });
  return (
    <form action={action} className="flex items-center gap-2">
      {state.message && (
        <span role="status" className="text-right text-xs text-ink-soft">
          {state.message}
        </span>
      )}
      <button
        type="submit"
        disabled={pending}
        title="Trimite în Google Calendar toate rezervările confirmate de azi înainte"
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-ink/25 px-4 text-[0.65rem] font-medium uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
      >
        <CalendarCheck size={14} />
        <span className="hidden sm:inline">{pending ? "Se sincronizează…" : "Sincronizează calendarul"}</span>
        <span className="sm:hidden">{pending ? "…" : "Calendar"}</span>
      </button>
    </form>
  );
}
