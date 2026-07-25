"use client";

// HiveFirstVisitExplainer — small one-line "what is this" hint shown
// under a primary CTA on first visit. Auto-hides forever once the user
// has interacted (caller is responsible for not rendering this when the
// post-interaction state is set; this helper just persists "I've dismissed
// it forever" once explicitly dismissed).
//
// Engine-specific copy via the `customMessage` prop. The catalog default
// is intentionally generic ("First visit? Try it out — your data stays
// on your device.") so engines that don't override get a sensible fallback.

import { useEffect, useState } from "react";
import { useStrings } from "./i18n";
import { useDismissalState } from "./useDismissalState";

const GOLD = "#D4AF37";

export type HiveFirstVisitExplainerProps = {
  engineName: string;
  engineSlug: string;
  /** Optional override for the explainer copy. */
  customMessage?: string;
};

export function HiveFirstVisitExplainer({
  engineName,
  engineSlug,
  customMessage,
}: HiveFirstVisitExplainerProps) {
  const s = useStrings({ engineName });
  const [show, setShow] = useState(false);
  const { dismissed } = useDismissalState({
    prefix: "hive_first_visit_seen",
    engineSlug,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dismissed) return;
    setShow(true);
  }, [dismissed]);

  if (!show) return null;
  const copy = customMessage ?? s.firstVisit.default;
  return <div style={explainerStyle}>{copy}</div>;
}

/** Imperative "user has interacted, stop showing this" helper. Engines call
 *  this after the user successfully completes the first action (e.g. drops
 *  a pin, runs the first conversion). Safe to call repeatedly. */
export function dismissHiveFirstVisitExplainer(engineSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`hive_first_visit_seen_${engineSlug}`, "1");
  } catch {
    // Silent.
  }
}

const explainerStyle: React.CSSProperties = {
  marginTop: 14,
  color: GOLD,
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: "0.01em",
  maxWidth: 320,
  textAlign: "center",
  lineHeight: 1.4,
};
