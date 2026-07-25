"use client";

// iOS guided install overlay — three-step instructions for adding the
// engine to the home screen via Safari's share sheet (the only path on
// iOS, since iOS Safari does not fire `beforeinstallprompt`).
//
// Deliberately minimal:
//   - Pure functional component, no createPortal (renders inline as a
//     fixed-position element). Past iOS regressions (PR #70 in ParkBack)
//     suggest createPortal interactions can be fragile on iOS Safari;
//     inline fixed-position is the safest equivalent.
//   - No useLayoutEffect, no document/window measurement at render time.
//   - No external icon dependencies — share + plus icons are inline SVG.

import { useEffect } from "react";
import { useStrings } from "./i18n";

const GOLD = "#D4AF37";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";
const PAPER = "#f5f1e6";

function ShareIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
         style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}>
      <path d="M12 3v12M12 3l-4 4M12 3l4 4"
            stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"
            stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
         style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}>
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={GOLD} strokeWidth="2" />
      <path d="M12 8v8M8 12h8" stroke={GOLD} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export type IOSInstallOverlayProps = {
  open: boolean;
  onClose: () => void;
  /** Engine display name, e.g. "ParkBack". Substituted into {{engineName}}. */
  engineName: string;
};

export function IOSInstallOverlay({ open, onClose, engineName }: IOSInstallOverlayProps) {
  const s = useStrings({ engineName });
  // Lock background scroll while open.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Escape key dismiss for desktop / external keyboard testing.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const o = s.install.overlay;

  return (
    <div role="dialog" aria-modal="true" aria-label={o.ariaLabel} onClick={onClose} style={backdropStyle}>
      <div onClick={(e) => e.stopPropagation()} style={cardStyle}>
        <div style={titleStyle}>{o.title}</div>
        <div style={bodyStyle}>{o.body}</div>
        <div style={stepStyle}>
          <span style={stepNumStyle}>1</span>
          <span style={stepTextStyle}>{o.step1} <ShareIcon size={18} /></span>
        </div>
        <div style={stepStyle}>
          <span style={stepNumStyle}>2</span>
          <span style={stepTextStyle}>{o.step2} <PlusIcon size={18} /></span>
        </div>
        <div style={stepStyle}>
          <span style={stepNumStyle}>3</span>
          <span style={stepTextStyle}>{o.step3}</span>
        </div>
        <button type="button" onClick={onClose} aria-label={o.ariaLabel} style={dismissButtonStyle}>
          {o.dismiss}
        </button>
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 16,
  zIndex: 70,
  paddingTop: "max(env(safe-area-inset-top), 16px)",
  paddingBottom: "max(env(safe-area-inset-bottom), 16px)",
};

const cardStyle: React.CSSProperties = {
  background: INK,
  color: PAPER,
  border: `1px solid ${GOLD_DIM}`,
  borderRadius: 16,
  padding: "20px 18px",
  maxWidth: 360,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const titleStyle: React.CSSProperties = {
  color: GOLD,
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "0.01em",
  lineHeight: 1.3,
};

const bodyStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 14,
  lineHeight: 1.5,
};

const stepStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-start",
  gap: 10,
  marginTop: 4,
};

const stepNumStyle: React.CSSProperties = {
  flex: "0 0 24px",
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: GOLD,
  color: INK,
  fontWeight: 700,
  fontSize: 13,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
};

const stepTextStyle: React.CSSProperties = {
  color: PAPER,
  fontSize: 14,
  lineHeight: 1.5,
  display: "inline",
};

const dismissButtonStyle: React.CSSProperties = {
  marginTop: 8,
  alignSelf: "flex-end",
  background: GOLD,
  color: INK,
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
  WebkitTapHighlightColor: "transparent",
};
