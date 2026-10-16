import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { localePath, locales } from "@/lib/i18n";

const pages: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/legal/rules", priority: 0.3 },
  { path: "/legal/terms", priority: 0.2 },
  { path: "/legal/privacy", priority: 0.2 },
  { path: "/legal/cancellation", priority: 0.2 },
];

/** Every page in every language, each listing its translations (hreflang). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (locale: (typeof locales)[number], path: string) =>
    `${site.domain}${localePath(locale, path) === "/" ? "" : localePath(locale, path)}`;
  return pages.flatMap(({ path, priority }) =>
    locales.map((locale) => ({
      url: url(locale, path),
      lastModified: now,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, url(l, path)])) },
    })),
  );
}
