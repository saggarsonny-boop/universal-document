"use client";

// HiveInstallHint — top-of-page banner inviting the user to install the
// engine to their home screen. Shows a localized message + an InstallCTA
// button on platforms that have an install path; falls back to instructional
// copy on desktop Safari / Firefox / unknown.
//
// Auto-hides:
//   - On iOS / chromium when the engine is already running standalone (PWA installed)
//   - When the user dismisses (× button) — persisted via useDismissalState
//     under hive_install_hint_dismissed_<engineSlug>
//   - When the appinstalled event fires (Chromium accepted the prompt)
//
// Engine-specific copy can be overridden via the `customMessage` prop. If
// not provided, the catalog's neutral default ("Add {{engineName}} to
// your home screen…") is used.

import { useEffect, useState } from "react";
import { useStrings } from "./i18n";
import { useInstallPrompt } from "./useInstallPrompt";
import { useDismissalState } from "./useDismissalState";
import { InstallCTA } from "./InstallCTA";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";
const INK = "#0a0a0a";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

export type HiveInstallHintProps = {
  /** Engine display name, e.g. "ParkBack". */
  engineName: string;
  /** Engine slug for localStorage isolation, e.g. "parkback". Lowercase, no spaces. */
  engineSlug: string;
  /** Optional override for the banner body copy (otherwise the catalog default). */
  customMessage?: string;
};

export function HiveInstallHint({ engineName, engineSlug, customMessage }: HiveInstallHintProps) {
  const s = useStrings({ engineName });
  const [show, setShow] = useState(false);
  const { platform, installed } = useInstallPrompt();
  const { dismissed, dismiss } = useDismissalState({
    prefix: "hive_install_hint_dismissed",
    engineSlug,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (dismissed) return;
    setShow(true);
  }, [dismissed]);

  // appinstalled fires on Chromium when the user accepts the native prompt.
  // Permanently dismiss so it doesn't reappear on subsequent visits.
  useEffect(() => {
    if (!installed) return;
    setShow(false);
    dismiss();
  }, [installed, dismiss]);

  if (!show) return null;

  const hasInstallPath = platform === "chromium" || platform === "ios";
  let bodyCopy: string;
  if (hasInstallPath) {
    bodyCopy = customMessage ?? s.install.banner.default;
  } else if (platform === "desktop-safari-firefox") {
    bodyCopy = s.install.fallback.desktopSafariFirefox;
  } else {
    bodyCopy = s.install.fallback.unknown;
  }

  return (
    <div role="region" aria-label={s.install.banner.regionAria} style={bannerStyle}>
      <div style={contentColumnStyle}>
        <div style={textStyle}>{bodyCopy}</div>
        {hasInstallPath ? (
          <div style={ctaRowStyle}>
            <InstallCTA size="sm" engineName={engineName} />
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => { setShow(false); dismiss(); }}
        aria-label={s.install.banner.dismissAria}
        style={dismissBtnStyle}
      >
        ×
      </button>
    </div>
  );
}

const bannerStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 520,
  marginTop: 8,
  marginBottom: 4,
  padding: "10px 14px 12px 16px",
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  borderRadius: 12,
  border: `1px solid ${GOLD_DIM}`,
  background: "linear-gradient(180deg, rgba(212, 175, 55, 0.10) 0%, rgba(212, 175, 55, 0.04) 100%)",
  color: INK,
  fontSize: 13,
  lineHeight: 1.45,
  textAlign: "left",
  boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
};

const contentColumnStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const textStyle: React.CSSProperties = {
  color: "#1e2d3d",
};

const ctaRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  marginTop: 2,
};

const dismissBtnStyle: React.CSSProperties = {
  flex: "0 0 auto",
  width: 28,
  height: 28,
  background: "transparent",
  color: MUTED,
  border: "none",
  borderRadius: 6,
  fontSize: 22,
  lineHeight: 1,
  cursor: "pointer",
  padding: 0,
  marginTop: -2,
};
