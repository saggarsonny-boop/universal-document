# @hive/onboarding

Shared install-prompt + first-visit + AHTS card components for every Hive
engine, plus the canonical brand assets. Single source of truth so onboarding
behaves identically across the ecosystem.

## v0.1 — onboarding components

Three engine-agnostic React components for the standard Hive onboarding stack,
extracted from ParkBack and refactored to take `engineName` / `engineSlug`
props. Ships canonical 7-locale i18n (en, es, fr, ar, hi, zh, pt — see
`MEMORY.md` "Canonical Hive free-tier locale set").

### Components

| Component | Where it appears | Behavior |
|---|---|---|
| `<HiveInstallHint />` | Top-of-page banner on first visit | Localized "Add to home screen" message + `<InstallCTA />` button. Auto-hides when running standalone, when dismissed (× button), or when `appinstalled` fires. Dismissal persisted under `hive_install_hint_dismissed_<engineSlug>`. |
| `<HiveFirstVisitExplainer />` | One-line explainer under the engine's primary CTA | Auto-hides forever on dismissal (`hive_first_visit_seen_<engineSlug>`). Engines that complete the first action call `dismissHiveFirstVisitExplainer(engineSlug)` imperatively. |
| `<HiveAHTSPrompt />` | Post-first-action card | Caller-controlled visibility (`open` / `onDismiss`). Renders the install CTA on Chromium/iOS, instructional fallback copy on desktop Safari/Firefox. |

All three components require an `engineName` (display label) and where
applicable an `engineSlug` (lowercase, no spaces, used for localStorage
isolation between engines on `*.hive.baby` subdomains).

### Quick-start

```tsx
import { HiveInstallHint, HiveAHTSPrompt, HiveFirstVisitExplainer } from "@hive/onboarding";

export default function HomePage() {
  return (
    <>
      <HiveInstallHint engineName="ParkBack" engineSlug="parkback" />
      <HiveFirstVisitExplainer engineName="ParkBack" engineSlug="parkback" />
      <HiveAHTSPrompt
        open={pinJustDropped}
        onDismiss={() => setPinJustDropped(false)}
        engineName="ParkBack"
      />
    </>
  );
}
```

### Engine-specific copy override

Each component accepts an optional `customMessage` prop that overrides the
catalog's neutral default. Use it when the engine has a more specific value
proposition than "Install for one-tap access" — e.g. ParkBack uses
"Works in any dead zone — no cell signal, wifi, or app store needed."

`customMessage` is a single localized string the engine resolves itself. The
package localizes the surrounding chrome (button labels, ARIA, dismiss copy)
via the bundled catalog.

## i18n

The bundled 7-locale catalog covers `en, es, fr, ar, hi, zh, pt` — every
canonical free-tier locale. The default `useStrings()` hook reads
`navigator.language` and picks the matching catalog after hydration; SSR
returns English.

Every catalog string carries a `{{engineName}}` placeholder, substituted at
render time from the `engineName` prop. To add more template variables (e.g.
`{{engineSlug}}` in user-facing copy), pass them through to the lower-level
`getStringsSync({ engineName, ...others })` helper.

### Locale extension — paid-tier 200-language support

Engines that offer a paid tier with extended language support (anything beyond
the free 7) can plug additional catalogs in at app startup without forking
this package:

```tsx
import { setLocaleOverrides, useStrings, type Strings } from "@hive/onboarding";
import jaCatalog from "./extra-locales/ja.json"; // engine-managed
import koCatalog from "./extra-locales/ko.json";

setLocaleOverrides({
  ja: jaCatalog as Strings,
  ko: koCatalog as Strings,
  // …up to 200 entries
});
```

Each extra catalog must conform to the `Strings` type (same nested keys as
`src/locales/en.json`). Override codes that already exist in the bundled set
will REPLACE the bundled catalog for that code.

The pattern keeps the free-tier bundle small (~10 KB for 7 locales) while
letting paid tiers ship arbitrary language coverage tree-shaken into the
engine that needs it.

### Canonical localStorage key pattern

Every dismissal-persistent component uses `useDismissalState({ prefix,
engineSlug })` which produces keys of the form `<prefix>_<engineSlug>`. The
canonical prefixes are:

| Prefix | Component |
|---|---|
| `hive_install_hint_dismissed` | `<HiveInstallHint />` |
| `hive_first_visit_seen`       | `<HiveFirstVisitExplainer />` |
| `hive_ahts_dismissed`         | `<HiveAHTSPrompt />` (caller manages) |

This matches the pattern established in ParkBack so re-skinning ParkBack onto
this package preserves all existing dismissal state for users.

## Brand assets

Single source of truth for the Hive logo and the simplified Hive mark.

| File | Use |
|---|---|
| `assets/hive-logo-full.png` (512×512, transparent) | Header logo on every Hive engine. Bitmap form. |
| `assets/hive-logo-full.webp` (512×512, transparent) | Same as above, smaller payload. Prefer for production references with PNG fallback. |
| `assets/hive-mark.svg` | Bare hex glyph, no text. Inlinable at any size from 16px to 200px. Used in footer signatures, inline brand references. |

## Regenerating the bitmap logo

```sh
python3 packages/hive-onboarding/scripts/gen_hive_logo.py
```

Requires Pillow (`pip install Pillow`). Output goes to `packages/hive-onboarding/assets/`.

The simplified `hive-mark.svg` is hand-written and does not need regeneration.

## How engines consume these assets

Engines under `apps/` are shipped as standalone Vercel projects and cannot
directly serve files outside their own `public/` directory. To use these assets,
copy them into the engine's `public/` at build time, or vendor them in
explicitly. The brand-integration PR for ParkBack establishes the canonical
pattern: `cp packages/hive-onboarding/assets/hive-logo-full.* apps/parkback/public/`.

When the workspace adopts a turborepo / pnpm-workspace setup that can resolve
`@hive/onboarding` imports, the engines can reference the package directly.
Until then, the copy-into-public pattern is the contract.

## Why these assets must not be diverged

Per `docs/HIVE_ENGINE_FINALIZATION_CHECKLIST.md` `HIVE INTEGRATION`:

> An engine that uses a different gold, a different hex shape, a different
> wordmark, or a different mark glyph reads as a stranger to the rest of the
> Hive. Brand recognition fragments and engines stop reinforcing each other.

If a future engine has a real reason to deviate (e.g. a co-branded engine), file
a waiver in the engine's `ENGINE_GRAMMAR.md` per the checklist's waiver clause.
