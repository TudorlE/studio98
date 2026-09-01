"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

export type CustomerFields = { name: string; email: string; phone: string };

const field =
  "h-12 w-full border border-line bg-transparent px-4 text-sm outline-none transition-colors focus:border-ink placeholder:text-ink-faint";

export function BookingForm({
  values,
  onChange,
  terms,
  onTermsChange,
  onSubmit,
  submitting,
  error,
  disabled,
}: {
  values: CustomerFields;
  onChange: (next: CustomerFields) => void;
  terms: boolean;
  onTermsChange: (v: boolean) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  disabled: boolean;
}) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label htmlFor="bf-name" className="eyebrow">
          Full name
        </label>
        <input
          id="bf-name"
          className={cn(field, "mt-2")}
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          autoComplete="name"
          required
          minLength={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bf-phone" className="eyebrow">
            Phone number
          </label>
          <input
            id="bf-phone"
            type="tel"
            className={cn(field, "mt-2")}
            value={values.phone}
            onChange={(e) => onChange({ ...values, phone: e.target.value })}
            autoComplete="tel"
            required
          />
        </div>
        <div>
          <label htmlFor="bf-email" className="eyebrow">
            Email
          </label>
          <input
            id="bf-email"
            type="email"
            className={cn(field, "mt-2")}
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            autoComplete="email"
            required
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-start gap-3 pt-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-ink"
          checked={terms}
          onChange={(e) => onTermsChange(e.target.checked)}
        />
        <span>
          I agree with the{" "}
          <Link href="/legal/terms" target="_blank" className="underline hover:text-ink">
            booking terms
          </Link>
          .
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm text-ink">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || submitting}
        className="mt-2 flex h-14 w-full items-center justify-center bg-ink text-[0.72rem] font-medium uppercase tracking-[0.18em] text-paper transition-colors hover:bg-ink-soft disabled:opacity-40"
      >
        {submitting ? "Processing…" : "Continue to payment"}
      </button>
    </form>
  );
}
