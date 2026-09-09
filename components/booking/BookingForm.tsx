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
  error,
}: {
  values: CustomerFields;
  onChange: (next: CustomerFields) => void;
  terms: boolean;
  onTermsChange: (v: boolean) => void;
  onSubmit: () => void;
  error: string | null;
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
          Your name
        </label>
        <input
          id="bf-name"
          className={cn(field, "mt-2")}
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          autoComplete="name"
          placeholder="Jane Doe"
          required
          minLength={2}
        />
      </div>

      <div>
        <label htmlFor="bf-phone" className="eyebrow">
          Phone
        </label>
        <input
          id="bf-phone"
          type="tel"
          className={cn(field, "mt-2")}
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          autoComplete="tel"
          placeholder="+373 ..."
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
          placeholder="you@email.com"
          required
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 pt-2 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-ink"
          checked={terms}
          onChange={(e) => onTermsChange(e.target.checked)}
        />
        <span>
          I agree to the{" "}
          <Link href="/legal/terms" target="_blank" className="underline hover:text-ink">
            booking rules
          </Link>
          .
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-ink">
          {error}
        </p>
      )}

      {/* Submitted from the sticky button below — Enter key still works. */}
      <button type="submit" className="sr-only">
        Book
      </button>
    </form>
  );
}
