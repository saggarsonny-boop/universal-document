# Inlined @hive/onboarding

> **Canonical source:** `saggarsonny-boop/hivebaby:packages/hive-onboarding/`.

This is an inlined copy of the `@hive/onboarding` package. The canonical
source lives in the hivebaby monorepo. We inline rather than vendor as a
workspace because the universal-document repo doesn't have a multi-app
node_modules hoisting setup, which makes cross-tree React deduplication
fragile.

When the canonical package bumps, mirror the changes here as a follow-up
PR. Files to keep in sync (one-to-one with hivebaby/packages/hive-onboarding/src/):

- `i18n.ts`
- `useInstallPrompt.ts`
- `useDismissalState.ts`
- `InstallCTA.tsx`
- `IOSInstallOverlay.tsx`
- `HiveInstallHint.tsx`
- `HiveFirstVisitExplainer.tsx`
- `HiveAHTSPrompt.tsx`
- `index.ts`
- `locales/{en,es,fr,ar,hi,zh,pt}.json`

## Why a path alias still exists

The TS path alias `@/lib/hive-onboarding` (or shorter, via `@hive/onboarding`
declared in `tsconfig.json` paths) lets engine code import as if from the
real package — keeps the import statements identical to what ParkBack
uses, so a future cutover to a real npm-published `@hive/onboarding`
needs no consumer changes.
