"use client";

// Shared install call-to-action button. Used by HiveInstallHint
// (no-pin home screen banner) and HiveAHTSPrompt (post-first-action card).
//
// Renders nothing on platforms without an install path (desktop Safari /
// Firefox / unknown). The caller is responsible for showing instructional
// fallback copy in those cases.
//
// On iOS, owns its own IOSInstallOverlay state. Two simultaneous mounts
// would each have their own overlay, but in practice the banner and the
// AHTS card are never visible at the same time, so there's no conflict.

import { useCallback, useState } from "react";
import { useInstallPrompt } from "./useInstallPrompt";
import { IOSInstallOverlay } from "./IOSInstallOverlay";
import { useStrings } from "./i18n";

const GOLD = "#D4AF37";
const GOLD_HI = "#FFE6A1";
const GOLD_DIM = "#8a6f1f";
const INK = "#0a0a0a";

type Size = "md" | "sm";

const SIZES: Record<Size, { padding: string; fontSize: number; iconSize: number; gap: number }> = {
  md: { padding: "10px 16px", fontSize: 14, iconSize: 18, gap: 8 },
  sm: { padding: "8px 14px", fontSize: 13, iconSize: 16, gap: 6 },
};

// Inline Hive hex glyph at the requested size. Mirrors hive-mark.svg from
// packages/hive-onboarding/assets — same vertices, same gradients — but
// inlined so we don't rely on an external file load on the install path.
function HiveMarkInline({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 100 86.6"
      width={size}
      height={Math.round(size * 86.6 / 100)}
      role="img"
      aria-hidden="true"
      style={{ display: "inline-block", verticalAlign: "middle", flex: "0 0 auto" }}
    >
      <defs>
        <linearGradient id="cta-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_HI} />
          <stop offset="40%" stopColor={GOLD} />
          <stop offset="100%" stopColor="#5e4a0d" />
        </linearGradient>
      </defs>
      <polygon
        points="25,0 75,0 100,43.3 75,86.6 25,86.6 0,43.3"
        fill="url(#cta-rim)"
        stroke={GOLD_DIM}
        strokeWidth="1"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export type InstallCTAProps = {
  /** Engine display name (used for the localized button label). */
  engineName: string;
  size?: Size;
};

export function InstallCTA({ engineName, size = "md" }: InstallCTAProps) {
  const s = useStrings({ engineName });
  const [overlayOpen, setOverlayOpen] = useState(false);
  const { platform, trigger } = useInstallPrompt();

  const handleClick = useCallback(async () => {
    try {
      const result = await trigger();
      if (result === "ios-needs-overlay") {
        setOverlayOpen(true);
        return;
      }
      // "accepted" / "dismissed" / "unavailable" — appinstalled (handled
      // at the layout level by the engine's own toast component) shows
      // the success toast on accepted; nothing for us to do here.
    } catch (err) {
      // Defensive: trigger() already wraps internals, but defend the
      // call site too.
      if (typeof console !== "undefined" && console.error) {
        console.error("[hive-onboarding] install trigger threw:", err);
      }
    }
  }, [trigger]);

  if (platform !== "ios" && platform !== "chromium") return null;

  const dims = SIZES[size];
  const ariaLabel = platform === "ios" ? s.install.ctaAriaIos : s.install.ctaAriaChromium;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: dims.gap,
          padding: dims.padding,
          background: GOLD,
          color: INK,
          border: "none",
          borderRadius: 999,
          fontSize: dims.fontSize,
          fontWeight: 700,
          letterSpacing: "0.02em",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          flex: "0 0 auto",
          maxWidth: "100%",
          boxShadow: "0 4px 14px rgba(212, 175, 55, 0.35)",
        }}
      >
        <HiveMarkInline size={dims.iconSize} />
        <span style={{ lineHeight: 1.2 }}>{s.install.cta}</span>
      </button>
      <IOSInstallOverlay open={overlayOpen} onClose={() => setOverlayOpen(false)} engineName={engineName} />
    </>
  );
}
