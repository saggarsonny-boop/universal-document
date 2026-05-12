// @hive/onboarding i18n loader.
//
// Ships the canonical Hive free-tier locale set:
//   en, es, fr, ar, hi, zh, pt
//
// Picks a locale at runtime from `navigator.language` (BCP-47 primary
// subtag). SSR returns English. After hydration, useStrings() swaps to
// the user's locale via a useEffect.
//
// Consumers (engine apps) can extend the bundled catalogs with extra
// locales via `setLocaleOverrides({ ja: <catalog>, ko: <catalog>, ... })`
// before the first render. This is the documented hook for paid-tier
// 200-language support: the package ships 7 locales for free; engines
// that need more can plug them in without forking this package. See
// README.md "Locale extension".
//
// Engine-specific copy substitution: every string passes through
// applyVars() which replaces {{engineName}} with the consumer-provided
// engineName at render time. Add more vars (e.g. {{engineSlug}}) by
// passing them to useStrings({ engineName, engineSlug }).

import { useEffect, useState } from "react";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";
import hi from "./locales/hi.json";
import zh from "./locales/zh.json";
import pt from "./locales/pt.json";

export type Strings = typeof en;
export type LocaleCode = "en" | "es" | "fr" | "ar" | "hi" | "zh" | "pt" | string;

export const CANONICAL_LOCALES: ReadonlyArray<LocaleCode> = [
  "en", "es", "fr", "ar", "hi", "zh", "pt",
] as const;

const BUILT_IN: Record<string, Strings> = { en, es, fr, ar, hi, zh, pt };
const overrides: Record<string, Strings> = {};

/**
 * Register additional locale catalogs at runtime. Use to extend the
 * bundled 7-locale set with more languages (e.g. for paid-tier engines
 * that need to serve 200 languages).
 *
 * Catalogs must conform to the Strings type (same nested keys as en).
 * If you pass a code that already exists, the override REPLACES the
 * built-in catalog for that code. Call once at app startup before the
 * first render.
 */
export function setLocaleOverrides(extra: Record<string, Strings>): void {
  for (const [code, cat] of Object.entries(extra)) {
    overrides[code] = cat;
  }
}

/** Pick a locale code from a BCP-47 navigator.language value. */
export function pickLocale(navigatorLanguage: string | undefined): LocaleCode {
  if (!navigatorLanguage) return "en";
  const primary = navigatorLanguage.toLowerCase().split("-")[0];
  if (primary in overrides) return primary;
  if (primary in BUILT_IN) return primary;
  return "en";
}

function getCatalog(code: LocaleCode): Strings {
  return overrides[code] ?? BUILT_IN[code] ?? BUILT_IN.en;
}

/** Variable bag for template substitution. {{engineName}} is the canonical
 *  required field; other entries are added as needed by future strings. */
export type StringVars = {
  engineName: string;
  /** Optional; reserved for future per-engine slug substitution. */
  engineSlug?: string;
  /** Arbitrary additional template variables. */
  [k: string]: string | undefined;
};

/** Replace every {{key}} in `template` with vars[key]. Missing keys are
 *  left unsubstituted (visible as `{{key}}`) so authoring mistakes are
 *  obvious during development.  */
export function applyVars(template: string, vars: StringVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (full, key) => {
    const v = vars[key as keyof StringVars];
    return typeof v === "string" ? v : full;
  });
}

/** Walk a Strings catalog and apply variable substitution to every leaf string.
 *  Returns a new catalog of the same shape with {{engineName}} etc. resolved. */
export function applyVarsDeep<T>(catalog: T, vars: StringVars): T {
  if (typeof catalog === "string") {
    return applyVars(catalog, vars) as unknown as T;
  }
  if (catalog === null || typeof catalog !== "object") return catalog;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(catalog as Record<string, unknown>)) {
    out[k] = applyVarsDeep(v, vars);
  }
  return out as T;
}

/**
 * Hook: returns the catalog matching navigator.language with
 * {{engineName}} (and any other vars) already substituted.
 *
 * SSR returns the English catalog with vars applied; the first client
 * render after hydration swaps to the user's locale.
 */
export function useStrings(vars: StringVars): Strings {
  const [catalog, setCatalog] = useState<Strings>(() => applyVarsDeep(en, vars));
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const code = pickLocale(navigator.language);
    setCatalog(applyVarsDeep(getCatalog(code), vars));
    // Re-apply vars whenever they change OR when overrides are added at
    // runtime — caller can change engineName per-route if desired.
  }, [vars.engineName, vars.engineSlug, vars]);
  return catalog;
}

/** Synchronous catalog for SSR / non-React code. Always English unless
 *  setLocaleOverrides has injected an override (rare; usually for testing). */
export function getStringsSync(vars: StringVars, code: LocaleCode = "en"): Strings {
  return applyVarsDeep(getCatalog(code), vars);
}
