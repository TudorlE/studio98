"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { LOCALE_COOKIE, localeLabel, localePath, locales, stripLocale, type Locale } from "@/lib/i18n";
import { useI18n } from "./I18nProvider";

/**
 * "RO · RU · EN". A plain link (full page load — each language is its own root
 * layout); the query string is kept so e.g. a confirmation page stays put.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale: current, t } = useI18n();
  const pathname = usePathname() ?? "/";
  const base = stripLocale(pathname);

  const go = (target: Locale) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=31536000; samesite=lax`;
    window.location.assign(localePath(target, base) + window.location.search + window.location.hash);
  };

  return (
    <nav aria-label={t.nav.language} className={cn("flex items-center sm:gap-1", className)}>
      {locales.map((l) => (
        <a
          key={l}
          href={localePath(l, base)}
          hrefLang={l}
          lang={l}
          title={localeLabel[l]}
          aria-current={l === current ? "true" : undefined}
          onClick={go(l)}
          className={cn(
            "grid h-8 min-w-7 place-items-center rounded-full px-1 text-[0.68rem] sm:min-w-8 sm:px-1.5 font-semibold uppercase tracking-[0.12em] transition-colors",
            l === current ? "text-ink" : "text-ink-faint hover:text-ink",
          )}
        >
          {l}
        </a>
      ))}
    </nav>
  );
}
