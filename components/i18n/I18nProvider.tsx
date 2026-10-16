"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultLocale, getDictionary, localePath, type Dictionary, type Locale } from "@/lib/i18n";

type I18n = {
  locale: Locale;
  t: Dictionary;
  /** Prefix an internal path with the current locale ("/legal/rules" → "/ru/legal/rules"). */
  path: (p?: string) => string;
};

const I18nContext = createContext<I18n>({
  locale: defaultLocale,
  t: getDictionary(defaultLocale),
  path: (p) => localePath(defaultLocale, p),
});

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <I18nContext.Provider
      value={{ locale, t: getDictionary(locale), path: (p) => localePath(locale, p) }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18n {
  return useContext(I18nContext);
}
