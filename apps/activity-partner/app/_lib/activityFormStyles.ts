// Shared design tokens + reusable form styles for the Phase 2 activity
// pages. Mirrors the inline-style pattern used elsewhere in the engine
// (ProfileSetupForm, HiveFooter) — Tailwind isn't installed.
//
// Mobile-first: every layout works at 320px width. Touch targets are at
// least 44×44px (WCAG 2.5.5 / Apple HIG). Focus styles use a 2px gold
// outline so keyboard navigation is visible against the dark theme.

import type { CSSProperties } from "react";

export const TOKENS = {
  ink: "#0a0a0a",
  paper: "#f5f1e6",
  paperDim: "#e8e2d0",
  muted: "#9a9588",
  goldDim: "#8a6f1f",
  gold: "#D4AF37",
  bgCard: "#1a1714",
  bgCardActive: "#251f17",
  border: "#3a342a",
  danger: "#e87a5d",
} as const;

export const PAGE_MAIN: CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: "16px 20px 0",
  color: TOKENS.paper,
  minWidth: 280,
};

export const TITLE: CSSProperties = {
  margin: "16px 0 8px",
  fontSize: 24,
  color: TOKENS.paper,
  fontWeight: 600,
  lineHeight: 1.25,
};

export const LEAD: CSSProperties = {
  marginTop: 0,
  marginBottom: 24,
  color: TOKENS.muted,
  fontSize: 14,
  lineHeight: 1.55,
};

export const LABEL: CSSProperties = {
  display: "block",
  fontSize: 13,
  color: TOKENS.paper,
  fontWeight: 600,
  marginBottom: 6,
};

export const HELP: CSSProperties = {
  fontSize: 12,
  color: TOKENS.muted,
  marginTop: 4,
  lineHeight: 1.45,
};

export const INPUT: CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  fontSize: 16,
  color: TOKENS.paper,
  background: TOKENS.bgCard,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
  outline: "none",
  boxSizing: "border-box",
};

export const TEXTAREA: CSSProperties = {
  ...INPUT,
  minHeight: 96,
  resize: "vertical",
  fontFamily: "inherit",
};

export const PRIMARY_BTN: CSSProperties = {
  minHeight: 44,
  padding: "10px 18px",
  fontSize: 15,
  fontWeight: 600,
  color: TOKENS.ink,
  background: TOKENS.gold,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  letterSpacing: "0.01em",
  WebkitAppearance: "none",
};

export const SECONDARY_BTN: CSSProperties = {
  minHeight: 44,
  padding: "10px 18px",
  fontSize: 15,
  color: TOKENS.paper,
  background: "transparent",
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
  cursor: "pointer",
  letterSpacing: "0.01em",
};

export const DANGER_BTN: CSSProperties = {
  ...SECONDARY_BTN,
  color: TOKENS.danger,
  borderColor: TOKENS.danger,
};

export const CARD: CSSProperties = {
  background: TOKENS.bgCard,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
};

export const CHIP: CSSProperties = {
  display: "inline-block",
  fontSize: 11,
  color: TOKENS.goldDim,
  border: `1px solid ${TOKENS.goldDim}`,
  borderRadius: 999,
  padding: "2px 8px",
  marginRight: 6,
  marginBottom: 4,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

// Used by radio + checkbox tiles. Each tile is a label wrapping the
// (visually hidden) input — the whole tile is the touch target.
export const TILE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  minHeight: 44,
  padding: "10px 14px",
  fontSize: 15,
  color: TOKENS.paper,
  background: TOKENS.bgCard,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
  cursor: "pointer",
  marginBottom: 8,
};

export const TILE_SELECTED: CSSProperties = {
  ...TILE,
  background: TOKENS.bgCardActive,
  border: `2px solid ${TOKENS.gold}`,
  // Keep total padding identical so selected/unselected tiles don't shift.
  padding: "9px 13px",
};

export const ERROR_BOX: CSSProperties = {
  background: "#3a1f1a",
  color: TOKENS.danger,
  border: `1px solid ${TOKENS.danger}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  marginBottom: 16,
  lineHeight: 1.45,
};

export const SUCCESS_BOX: CSSProperties = {
  background: "#1f2e1a",
  color: TOKENS.gold,
  border: `1px solid ${TOKENS.gold}`,
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  marginBottom: 16,
  lineHeight: 1.45,
};

export const STEP_HEADER: CSSProperties = {
  fontSize: 11,
  color: TOKENS.muted,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  marginBottom: 4,
};

export const FOCUS_RING_CSS = `
  *:focus-visible {
    outline: 2px solid ${TOKENS.gold};
    outline-offset: 2px;
    border-radius: 6px;
  }
`;
