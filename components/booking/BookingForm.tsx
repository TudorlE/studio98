"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { houseRules } from "@/lib/rules";

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
  const rulesRef = useRef<HTMLDivElement>(null);
  const [hasReadRules, setHasReadRules] = useState(false);

  const checkScrolled = () => {
    const el = rulesRef.current;
    if (!el) return;
    // Also passes if the whole thing already fits with no scrolling needed.
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) setHasReadRules(true);
  };

  useEffect(() => {
    checkScrolled();
  }, []);

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
          Numele tău
        </label>
        <input
          id="bf-name"
          className={cn(field, "mt-2")}
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          autoComplete="name"
          placeholder="Ana Popescu"
          required
          minLength={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bf-phone" className="eyebrow">
            Telefon
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
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className="pt-2">
        <p className="eyebrow">Regulile casei</p>
        <div
          ref={rulesRef}
          onScroll={checkScrolled}
          className="mt-2 max-h-48 overflow-y-auto border border-line p-4 text-sm text-ink-soft"
        >
          <div className="space-y-2.5">
            {houseRules.map((rule) => (
              <p key={rule}>{rule}</p>
            ))}
          </div>
        </div>
        {!hasReadRules && (
          <p className="mt-1.5 text-xs text-ink-faint">
            Derulează până la final ca să poți continua.
          </p>
        )}
      </div>

      <label
        className={cn(
          "flex items-start gap-3 pt-1 text-sm text-ink-soft",
          hasReadRules ? "cursor-pointer" : "cursor-not-allowed opacity-50",
        )}
      >
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-ink"
          checked={terms}
          disabled={!hasReadRules}
          onChange={(e) => onTermsChange(e.target.checked)}
        />
        <span>Am citit și sunt de acord cu regulile casei.</span>
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-ink">
          {error}
        </p>
      )}

      {/* Submitted from the sticky button below — Enter key still works. */}
      <button type="submit" className="sr-only">
        Rezervă
      </button>
    </form>
  );
}
