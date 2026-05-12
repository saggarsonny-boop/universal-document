"use client";

// Age-band gate. Runs BEFORE Clerk so we never accept a sign-up that didn't
// answer the age question. Three exits:
//   - "Under 18"        → /under-18 friction page (no signup)
//   - 18-24             → sessionStorage hap_age_band=18-24 + Clerk sign-up;
//                         age_verified flips later via Stripe Identity
//   - 25-34, 35-44, …   → sessionStorage hap_age_band + Clerk sign-up
//
// We deliberately do NOT offer a "skip for now" — the brief mandates this.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AGE_BANDS, type AgeBand } from "@/lib/profile";
import { useStrings } from "../_lib/useStrings";

const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

const STORAGE_KEY = "hap_age_band";

export default function SignupGate() {
  const s = useStrings().signup;
  const router = useRouter();
  const [selected, setSelected] = useState<"under-18" | AgeBand | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onContinue() {
    if (!selected) {
      setError(s.errorPick);
      return;
    }
    if (selected === "under-18") {
      router.push("/under-18");
      return;
    }
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, selected);
    }
    router.push("/sign-up");
  }

  return (
    <main style={mainStyle}>
      <h1 style={titleStyle}>{s.title}</h1>
      <p style={leadStyle}>{s.lead}</p>

      <fieldset style={fieldsetStyle} aria-describedby="signup-help">
        <legend style={legendStyle}>{s.legend}</legend>
        <p id="signup-help" style={helpStyle}>{s.help}</p>

        <AgeOption
          value="under-18"
          label={s.options.under18}
          selected={selected === "under-18"}
          onSelect={() => { setSelected("under-18"); setError(null); }}
        />
        {AGE_BANDS.map((band) => (
          <AgeOption
            key={band}
            value={band}
            label={band}
            selected={selected === band}
            sublabel={band === "18-24" ? s.options.requiresVerification : undefined}
            onSelect={() => { setSelected(band); setError(null); }}
          />
        ))}
      </fieldset>

      {error ? <div role="alert" style={errorStyle}>{error}</div> : null}

      <button type="button" onClick={onContinue} style={ctaStyle}>
        {s.continue}
      </button>

      <Link href="/sign-in" style={signInLinkStyle}>{s.alreadyHaveAccount}</Link>
    </main>
  );
}

function AgeOption({
  value,
  label,
  sublabel,
  selected,
  onSelect,
}: {
  value: string;
  label: string;
  sublabel?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      style={{
        ...optionStyle,
        borderColor: selected ? GOLD : "#2a2a2a",
        background: selected ? "rgba(212,175,55,0.08)" : "transparent",
      }}
    >
      <input
        type="radio"
        name="ageBand"
        value={value}
        checked={selected}
        onChange={onSelect}
        style={radioStyle}
      />
      <div style={optionTextStyle}>
        <span style={{ color: PAPER, fontWeight: 500 }}>{label}</span>
        {sublabel ? <span style={{ color: MUTED, fontSize: 12 }}>{sublabel}</span> : null}
      </div>
    </label>
  );
}

const mainStyle: React.CSSProperties = {
  maxWidth: 480,
  margin: "0 auto",
  padding: "16px 20px 40px",
};

const titleStyle: React.CSSProperties = {
  margin: "16px 0 8px",
  fontSize: 24,
  color: PAPER,
  fontWeight: 600,
};

const leadStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 20,
  color: MUTED,
  fontSize: 15,
  lineHeight: 1.5,
};

const fieldsetStyle: React.CSSProperties = {
  border: 0,
  padding: 0,
  margin: 0,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const legendStyle: React.CSSProperties = {
  color: PAPER,
  fontWeight: 500,
  marginBottom: 4,
  fontSize: 16,
};

const helpStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 12,
  color: MUTED,
  fontSize: 13,
  lineHeight: 1.4,
};

const optionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 14px",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  cursor: "pointer",
  minHeight: 44,
};

const optionTextStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const radioStyle: React.CSSProperties = {
  width: 18,
  height: 18,
  accentColor: GOLD,
};

const ctaStyle: React.CSSProperties = {
  marginTop: 20,
  width: "100%",
  minHeight: 48,
  background: GOLD,
  color: "#0a0a0a",
  border: 0,
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  color: "#ff8a8a",
  fontSize: 13,
};

const signInLinkStyle: React.CSSProperties = {
  marginTop: 16,
  display: "block",
  textAlign: "center",
  color: MUTED,
  textDecoration: "underline",
  fontSize: 13,
};
