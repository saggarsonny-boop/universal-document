// @ts-nocheck
"use client";

// B2B-tier waitlist form. Used by /clinic, /practice, and /enterprise
// landing pages. Posts to /api/waitlist with the tier slug + the
// captured fields. Successful submits show the confirmation message
// from the paywall Phase 1 spec verbatim:
//
//   "You'll be notified when this tier launches. Pricing may change
//    before launch; you'll be offered the rate active at launch time."

import { useState } from "react";

const HIVE_GOLD = "#D4AF37";
const HIVE_INK = "#0a0a0a";
const PAPER = "#f5f1e6";

interface Props {
  /** "clinic" | "practice" | "enterprise" â€” passed verbatim to the
   *  hps_waitlist.requested_tier column. */
  tierSlug: "clinic" | "practice" | "enterprise";
  /** Display name shown in the form heading. */
  tierName: string;
}

const ROLE_OPTIONS = [
  "Physician / clinician",
  "Practice administrator",
  "Health-system IT / informatics",
  "Other",
];

const VOLUME_OPTIONS = [
  "< 100 reports / month",
  "100 â€“ 500 / month",
  "500 â€“ 2,000 / month",
  "2,000 â€“ 10,000 / month",
  "> 10,000 / month",
];

export function WaitlistForm({ tierSlug, tierName }: Props) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [volume, setVolume] = useState(VOLUME_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          company,
          role,
          expectedVolume: volume,
          requestedTier: tierSlug,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Could not submit (HTTP ${res.status}).`);
        return;
      }
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not reach the server. Please try again in a moment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div
        role="status"
        style={{
          padding: 18,
          background: PAPER,
          color: HIVE_INK,
          border: `1px solid ${HIVE_GOLD}`,
          borderRadius: 12,
          maxWidth: 520,
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>You&apos;re on the list.</p>
        <p style={{ margin: 0 }}>
          You&apos;ll be notified when this tier launches. Pricing may change
          before launch; you&apos;ll be offered the rate active at launch time.
        </p>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    border: `1px solid ${HIVE_INK}`,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    background: "white",
    color: HIVE_INK,
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.02em",
    marginBottom: 4,
    color: HIVE_INK,
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitting && email && company) void submit();
      }}
      style={{
        maxWidth: 520,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <label htmlFor="hps-wl-email" style={labelStyle}>Work email</label>
        <input
          id="hps-wl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@yourorganization.example"
          style={fieldStyle}
        />
      </div>
      <div>
        <label htmlFor="hps-wl-company" style={labelStyle}>{tierName} / organization</label>
        <input
          id="hps-wl-company"
          type="text"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="Organization name"
          style={fieldStyle}
        />
      </div>
      <div>
        <label htmlFor="hps-wl-role" style={labelStyle}>Your role</label>
        <select
          id="hps-wl-role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={fieldStyle}
        >
          {ROLE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="hps-wl-volume" style={labelStyle}>Expected use volume</label>
        <select
          id="hps-wl-volume"
          value={volume}
          onChange={(e) => setVolume(e.target.value)}
          style={fieldStyle}
        >
          {VOLUME_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        disabled={submitting || !email || !company}
        style={{
          background: HIVE_GOLD,
          color: HIVE_INK,
          border: 0,
          borderRadius: 12,
          padding: "12px 22px",
          fontSize: 15,
          fontWeight: 700,
          cursor: submitting ? "not-allowed" : "pointer",
          opacity: submitting || !email || !company ? 0.7 : 1,
          letterSpacing: "0.02em",
        }}
      >
        {submitting ? "Submittingâ€¦" : "Join waitlist"}
      </button>
      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            color: "#9a1c1c",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {error}
        </p>
      )}
    </form>
  );
}
