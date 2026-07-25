// Locale loader. English is the floor; the other six canonical Hive
// locales (es, fr, ar, hi, zh, pt) ship in the follow-up i18n PR per
// ENGINE_GRAMMAR Phase 3. For now the loader resolves to en regardless of
// navigator.language, but the detection wiring is in place so that adding
// a locale file is a one-line registration when the catalog lands.

import en from "@/locales/en.json";

export type Strings = typeof en;
export type Locale = "en" | "es" | "fr" | "ar" | "hi" | "zh" | "pt";

const CATALOGS: Partial<Record<Locale, Strings>> = { en };

export function pickLocale(navigatorLanguage: string | undefined): Locale {
  if (!navigatorLanguage) return "en";
  const primary = navigatorLanguage.toLowerCase().split("-")[0] as Locale;
  if (primary in CATALOGS) return primary;
  return "en";
}

/** Server-safe string lookup; returns the English bundle until other
 *  locales are added. Client components that need locale switching should
 *  wrap this in a hook that reads `navigator.language` at runtime. */
export function getStrings(locale?: Locale): Strings {
  if (locale && CATALOGS[locale]) return CATALOGS[locale] as Strings;
  return en;
}

/** Convenience export — the English bundle, suitable for direct use in
 *  server components without going through a hook. */
export const strings: Strings = en;

/** Detect the active locale from the runtime if available, otherwise
 *  fall back to English. Safe in both server and client contexts; the
 *  navigator branch only fires in the browser. */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return pickLocale(navigator.language);
}
