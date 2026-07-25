// @ts-nocheck
"use client";

// Per-use disclaimer modal â€” shown on first interaction in every browser
// session. Acceptance is recorded in `sessionStorage` so a refresh in
// the same tab session doesn't re-prompt, but a fresh tab / new browser
// session does. Per the paywall Phase 1 spec the user must explicitly
// confirm personal-use only before any report is processed.
//
// Storage key: `hps_disclaimer_accepted_v1`. Bump the suffix when the
// disclaimer copy changes substantively so previously-accepted users see
// the new wording.

import { useEffect, useState } from "react";

const STORAGE_KEY = "hps_disclaimer_accepted_v1";
const HIVE_GOLD = "#D4AF37";
const HIVE_INK = "#0a0a0a";
const PAPER = "#f5f1e6";

interface Props {
  /** Optional callback when the user accepts. Used by the home page to
   *  pre-check the per-submit confirmation checkbox. */
  onAccept?: () => void;
}

export function DisclaimerModal({ onAccept }: Props) {
  const [needsAck, setNeedsAck] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const accepted =
      window.sessionStorage.getItem(STORAGE_KEY) === "1";
    setNeedsAck(!accepted);
  }, []);

  const accept = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    }
    setNeedsAck(false);
    onAccept?.();
  };

  if (!needsAck) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hps-disclaimer-title"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 10, 10, 0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9000,
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 540,
          width: "100%",
          background: PAPER,
          color: HIVE_INK,
          borderRadius: 16,
          border: `1px solid ${HIVE_GOLD}`,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <h2
          id="hps-disclaimer-title"
          style={{
            margin: "0 0 12px",
            fontSize: 18,
            letterSpacing: "0.01em",
          }}
        >
          Personal use only
        </h2>
        <p style={{ margin: "0 0 12px" }}>
          By using HivePlainScan, I confirm that this report is for my{" "}
          <strong>personal educational use only</strong>. I am not using it for
          clinical decision-making, professional medical advice, or for any
          third party.
        </p>
        <p style={{ margin: "0 0 18px" }}>
          I understand HivePlainScan is not a medical service and does not
          replace professional healthcare guidance.
        </p>
        <button
          type="button"
          onClick={accept}
          style={{
            background: HIVE_GOLD,
            color: HIVE_INK,
            border: 0,
            borderRadius: 12,
            padding: "12px 22px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            width: "100%",
            letterSpacing: "0.02em",
          }}
        >
          I Agree
        </button>
      </div>
    </div>
  );
}

/** Read the session-scoped acceptance flag from outside the modal â€” used
 *  by the submit form to pre-check its persistent confirmation
 *  checkbox. */
export function isDisclaimerAccepted(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === "1";
}
