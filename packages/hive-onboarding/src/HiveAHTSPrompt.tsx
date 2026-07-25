"use client";

// HiveAHTSPrompt — post-first-action "Add to Home Screen" prompt card.
// Mounted by the engine when the user successfully completes their first
// action (e.g. drops their first pin in ParkBack, runs first conversion).
// Caller owns visibility (open/onDismiss) so the trigger logic stays where
// the engine's first-action lives.
//
// Platform-aware:
//   - chromium / iOS → render the shared InstallCTA button
//   - desktop-safari-firefox / unknown → render instructional fallback copy
//
// Caller is expected to wire dismissal persistence via useDismissalState
// with prefix "hive_ahts_dismissed" + engineSlug.

import { useStrings } from "./i18n";
import { useInstallPrompt } from "./useInstallPrompt";
import { InstallCTA } from "./InstallCTA";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

export type HiveAHTSPromptProps = {
  open: boolean;
  onDismiss: () => void;
  /** Engine display name. */
  engineName: string;
  /** Optional override for the card body copy. */
  customMessage?: string;
};

export function HiveAHTSPrompt({ open, onDismiss, engineName, customMessage }: HiveAHTSPromptProps) {
  const s = useStrings({ engineName });
  const { platform } = useInstallPrompt();
  if (!open) return null;

  const card = s.install.ahtsCard;
  const fallback = s.install.fallback;
  const hasInstallPath = platform === "ios" || platform === "chromium";
  const fallbackCopy =
    platform === "desktop-safari-firefox" ? fallback.desktopSafariFirefox : fallback.unknown;
  const body = customMessage ?? card.body;

  return (
    <div role="dialog" aria-label={card.title} style={cardStyle}>
      <div style={titleStyle}>{card.title}</div>
      <div style={bodyStyle}>{body}</div>

      {hasInstallPath ? (
        <div style={ctaRowStyle}>
          <InstallCTA size="sm" engineName={engineName} />
        </div>
      ) : (
        <div style={fallbackBodyStyle}>{fallbackCopy}</div>
      )}

      <button type="button" onClick={onDismiss} style={dismissButtonStyle}>
        {card.dismiss}
      </button>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: 12,
  border: `1px solid ${GOLD_DIM}`,
  background: "rgba(212, 175, 55, 0.06)",
  color: PAPER,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  maxWidth: 360,
  textAlign: "left",
};

const titleStyle: React.CSSProperties = {
  color: GOLD,
  fontWeight: 600,
  fontSize: 14,
};

const bodyStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 13,
  lineHeight: 1.4,
};

const fallbackBodyStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 12,
  lineHeight: 1.5,
  marginTop: 2,
};

const ctaRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-start",
  marginTop: 4,
};

const dismissButtonStyle: React.CSSProperties = {
  alignSelf: "flex-end",
  background: "transparent",
  color: GOLD,
  border: `1px solid ${GOLD}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
