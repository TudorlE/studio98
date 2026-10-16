/**
 * Site languages. Romanian is the default and keeps its unprefixed URLs
 * ("/", "/legal/rules"); Russian and English live under "/ru" and "/en".
 * proxy.ts rewrites unprefixed requests to the "ro" segment internally.
 */
export const locales = ["ro", "ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ro";

/** Cookie remembering the visitor's last explicit language choice. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return locales.includes(value as Locale);
}

/** BCP 47 tags for Intl formatting. */
export const intlLocale: Record<Locale, string> = {
  ro: "ro-RO",
  ru: "ru-RU",
  en: "en-GB",
};

export const localeLabel: Record<Locale, string> = {
  ro: "Română",
  ru: "Русский",
  en: "English",
};

/** "/legal/rules" → "/ru/legal/rules" (Romanian stays unprefixed). */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Strip any locale prefix: "/en/legal/rules" → "/legal/rules". */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first)) return `/${rest.join("/")}`;
  return pathname || "/";
}
