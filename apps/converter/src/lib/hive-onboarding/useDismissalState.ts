"use client";

// useDismissalState — canonical hive_*_<engineSlug> localStorage key pattern
// for "user dismissed this hint, never show again" semantics. Used by
// HiveInstallHint, HiveFirstVisitExplainer, HiveAHTSPrompt and any future
// onboarding component that needs persistent "seen / dismissed" state.
//
// The key is composed from a `prefix` and the engine slug, so engines stay
// isolated from each other's dismissal state on the same origin (hive.baby
// subdomains share top-level cookies but each subdomain has its own
// localStorage).
//
// API:
//   const { dismissed, dismiss, reset } = useDismissalState({
//     prefix: "hive_install_hint_dismissed",
//     engineSlug: "parkback",
//   });
//
// localStorage key produced: "hive_install_hint_dismissed_parkback"

import { useCallback, useEffect, useState } from "react";

export type UseDismissalStateOptions = {
  /** First half of the localStorage key, e.g. "hive_install_hint_dismissed". */
  prefix: string;
  /** Engine slug (lowercase, hyphen-free), e.g. "parkback", "udconverter". */
  engineSlug: string;
};

export type DismissalState = {
  /** True iff the user has previously dismissed this hint. SSR-safe (false until hydrated). */
  dismissed: boolean;
  /** Persist dismissal. Idempotent. localStorage failures are silent. */
  dismiss: () => void;
  /** Clear dismissal. Mainly for testing or "show this hint again" UX. */
  reset: () => void;
};

export function useDismissalState({ prefix, engineSlug }: UseDismissalStateOptions): DismissalState {
  const key = `${prefix}_${engineSlug}`;
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(key) === "1") setDismissed(true);
    } catch {
      // localStorage disabled — treat as not dismissed; banner will show.
    }
  }, [key]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      // Silent — at worst the user sees the hint again next visit.
    }
  }, [key]);

  const reset = useCallback(() => {
    setDismissed(false);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Silent.
    }
  }, [key]);

  return { dismissed, dismiss, reset };
}
