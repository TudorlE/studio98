"use client";

import { useEffect, useState } from "react";
import { createPortal, useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";

/**
 * Trash button that asks for confirmation in an on-site dialog (not the
 * browser's own confirm box), then submits `action` with `name=value`.
 */
export function ConfirmDeleteButton({
  action,
  name,
  value,
  title,
  message,
  size = "md",
}: {
  action: (formData: FormData) => Promise<void>;
  name: string;
  value: string;
  title: string;
  message: string;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={title}
        title={title}
        className={
          size === "sm"
            ? "grid h-7 w-7 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-red-50 hover:text-red-600"
            : "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-ink-faint transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        }
      >
        <Trash2 size={size === "sm" ? 13 : 14} strokeWidth={1.75} />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
            <button
              type="button"
              aria-label="Închide"
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="relative w-full max-w-sm rounded-3xl bg-paper p-6 shadow-xl"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
                <Trash2 size={18} strokeWidth={1.75} />
              </div>
              <p id="confirm-title" className="mt-4 font-serif text-xl tracking-tight">
                {title}
              </p>
              <p className="mt-2 text-sm text-ink-soft">{message}</p>
              <form
                action={async (fd) => {
                  await action(fd);
                  setOpen(false);
                }}
                className="mt-6 flex gap-2"
              >
                <input type="hidden" name={name} value={value} />
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  className="h-11 flex-1 rounded-full border border-ink/20 text-sm font-medium transition-colors hover:bg-paper-deep"
                >
                  Anulează
                </button>
                <SubmitButton />
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 flex-1 rounded-full bg-red-600 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? "Se șterge…" : "Șterge"}
    </button>
  );
}
