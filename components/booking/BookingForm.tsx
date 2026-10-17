"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/lib/booking";
import { useI18n } from "@/components/i18n/I18nProvider";

export type CustomerFields = { name: string; email: string; phone: string };

const field =
  "h-12 w-full border border-line bg-transparent px-4 text-sm outline-none transition-colors focus:border-ink placeholder:text-ink-faint";
const legalLink = "text-ink underline underline-offset-2 hover:text-accent";

export function BookingForm({
  values,
  onChange,
  terms,
  onTermsChange,
  consent,
  onConsentChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentHints,
  onSubmit,
  error,
}: {
  values: CustomerFields;
  onChange: (next: CustomerFields) => void;
  terms: boolean;
  onTermsChange: (v: boolean) => void;
  /** Agreement to the terms + personal-data processing (privacy policy). */
  consent: boolean;
  onConsentChange: (v: boolean) => void;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  /** One-line explanation under each payment option. */
  paymentHints: Record<PaymentMethod, string>;
  onSubmit: () => void;
  error: string | null;
}) {
  const { t: dict, path } = useI18n();
  const t = dict.booking.form;
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
          {t.name}
        </label>
        <input
          id="bf-name"
          className={cn(field, "mt-2")}
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          autoComplete="name"
          placeholder={t.namePlaceholder}
          required
          minLength={2}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bf-phone" className="eyebrow">
            {t.phone}
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
            {t.email}
          </label>
          <input
            id="bf-email"
            type="email"
            className={cn(field, "mt-2")}
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
            autoComplete="email"
            placeholder={t.emailPlaceholder}
            required
          />
        </div>
      </div>

      <fieldset className="pt-2">
        <legend className="eyebrow">{t.howToPay}</legend>
        <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
          {(
            [
              ["mia", t.mia],
              ["onsite", t.onsite],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-start gap-3 border p-4 text-sm transition-colors",
                paymentMethod === value ? "border-ink" : "border-line hover:border-ink/40",
              )}
            >
              <input
                type="radio"
                name="bf-payment"
                className="mt-0.5 h-4 w-4 accent-ink"
                checked={paymentMethod === value}
                onChange={() => onPaymentMethodChange(value)}
              />
              <span>
                <span className="block font-medium text-ink">{label}</span>
                <span className="mt-1 block text-xs text-ink-soft">{paymentHints[value]}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="pt-2">
        <p className="eyebrow">{t.rules}</p>
        <div
          ref={rulesRef}
          onScroll={checkScrolled}
          className="mt-2 max-h-48 overflow-y-auto border border-line p-4 text-sm text-ink-soft"
        >
          <ol className="space-y-3">
            {dict.rules.map((rule, i) => (
              <li key={rule.title}>
                <span className="font-medium text-ink">
                  {i + 1}. {rule.title}.
                </span>{" "}
                {rule.body}
              </li>
            ))}
          </ol>
        </div>
        {!hasReadRules && (
          <p className="mt-1.5 text-xs text-ink-faint">
            {t.scrollHint}
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
        <span>{t.agree}</span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-ink-soft">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-ink"
          checked={consent}
          onChange={(e) => onConsentChange(e.target.checked)}
          required
        />
        <span>
          {t.consent.before}
          <a href={path("/legal/terms")} target="_blank" rel="noopener" className={legalLink}>
            {t.consent.terms}
          </a>
          {t.consent.middle}
          <a href={path("/legal/privacy")} target="_blank" rel="noopener" className={legalLink}>
            {t.consent.privacy}
          </a>
          {t.consent.after}
        </span>
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-ink">
          {error}
        </p>
      )}

      {/* Submitted from the sticky button below — Enter key still works. */}
      <button type="submit" className="sr-only">
        {t.submit}
      </button>
    </form>
  );
}
