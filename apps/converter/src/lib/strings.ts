// UD Converter i18n loader.
//
// Canonical Hive free-tier locale set: en, es, fr, ar, hi, zh, pt
// (per docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md and the Memory entry
// "Canonical Hive free-tier locale set"). Every Hive engine is expected
// to ship the same 7-language catalog.
//
// Usage:
//   - `strings` exports the synchronous English catalog. SSR-safe; use
//     in any code path that runs before client hydration.
//   - `useStrings()` is the React hook for client components. Returns
//     English on first render (SSR/hydration-safe), then swaps to the
//     locale matching `navigator.language` after mount, falling back to
//     English when the user's primary subtag isn't in the canonical 7.
//
// The locale catalog files are statically imported so they ship in the
// client bundle — small JSON, no perf concern, no runtime fetch needed.

import { useEffect, useState } from 'react'

import en from '../../locales/en.json'
import es from '../../locales/es.json'
import fr from '../../locales/fr.json'
import ar from '../../locales/ar.json'
import hi from '../../locales/hi.json'
import zh from '../../locales/zh.json'
import pt from '../../locales/pt.json'

export type Strings = typeof en

const CATALOGS: Record<string, Strings> = { en, es, fr, ar, hi, zh, pt }

// English-only synchronous export. Use for SSR paths and any non-React
// code (share text built before render, server-side error messages, etc.).
// Components that want the user's locale should call `useStrings()`.
export const strings: Strings = en

function pickLocale(navigatorLanguage: string | undefined): keyof typeof CATALOGS {
  if (!navigatorLanguage) return 'en'
  // navigator.language is BCP-47 (e.g. "en-GB", "zh-Hant"). Match on
  // primary subtag. "zh-*" all map to the simplified-Chinese catalog
  // we ship; if Traditional Chinese ever needs splitting, add a
  // "zh-Hant" catalog and tighten this matcher.
  const primary = navigatorLanguage.toLowerCase().split('-')[0]
  if (primary in CATALOGS) return primary as keyof typeof CATALOGS
  return 'en'
}

// Hook returns the localized catalog. SSR returns English; on first
// client render after hydration, a useEffect swaps to the user's locale.
// The brief "flash of English" is the cost of supporting locales without
// server-side language negotiation — acceptable for UD Converter today
// (the conversion flow is mostly localized after hydration finishes).
export function useStrings(): Strings {
  const [s, setS] = useState<Strings>(en)
  useEffect(() => {
    if (typeof navigator === 'undefined') return
    const code = pickLocale(navigator.language)
    setS(CATALOGS[code])
  }, [])
  return s
}
