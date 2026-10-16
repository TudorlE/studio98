import type { Locale } from "@/lib/i18n/config";
import { ro, type Dictionary } from "@/lib/i18n/dictionaries/ro";
import { ru } from "@/lib/i18n/dictionaries/ru";
import { en } from "@/lib/i18n/dictionaries/en";

export * from "@/lib/i18n/config";
export * from "@/lib/i18n/format";
export type { Dictionary };

const dictionaries: Record<Locale, Dictionary> = { ro, ru, en };

/** Plain objects — safe to use on the server and in client components. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
