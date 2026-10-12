"use client";

import { Trash2 } from "lucide-react";
import { removeBooking } from "./actions";

export function DeleteBookingButton({ bookingId, label }: { bookingId: string; label: string }) {
  return (
    <form
      action={removeBooking}
      onSubmit={(e) => {
        if (!window.confirm(`Ștergi definitiv rezervarea ${label}?`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <button
        type="submit"
        aria-label="Șterge rezervarea"
        title="Șterge rezervarea"
        className="grid h-9 w-9 place-items-center rounded-full border border-line text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={14} strokeWidth={1.75} />
      </button>
    </form>
  );
}
