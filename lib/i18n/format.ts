import { intlLocale, type Locale } from "@/lib/i18n/config";

/** Plural forms keyed by Intl plural category; `{n}` is replaced by the count. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/**
 * "{n} oră" / "{n} ore" / "{n} de ore" (ro), "{n} час" / "{n} часа" / "{n} часов" (ru)…
 * Categories come from Intl.PluralRules, so each language gets its own rules.
 */
export function plural(locale: Locale, n: number, forms: PluralForms): string {
  const category = new Intl.PluralRules(intlLocale[locale]).select(n);
  return (forms[category] ?? forms.other).replace("{n}", String(n));
}

/** Replace `{name}` placeholders: fmt("Pasul {step} din 3", { step: 2 }). */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in vars ? String(vars[key]) : m,
  );
}

/** "2026-10-16" → "vineri, 16 octombrie 2026" / "пятница, 16 октября 2026 г." / "Friday 16 October 2026". */
export function formatLongDate(locale: Locale, iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}
