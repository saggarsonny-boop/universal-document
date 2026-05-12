"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AGE_BANDS, type AgeBand } from "@/lib/profile";
import { suggestCities } from "@/lib/cities";
import { LANGUAGES } from "@/lib/languages";

const GOLD = "#D4AF37";
const PAPER = "#f5f1e6";
const MUTED = "#9a9588";

type Props = {
  existingHap: {
    ageBand: AgeBand;
    city: string;
    neighborhood: string;
  } | null;
  existingProfile: {
    displayName: string;
    bio: string;
    languagesSpoken: string[];
    photoUrl: string | null;
    isOpenToRomanticInterest: boolean;
  } | null;
};

const SESSION_AGE_KEY = "hap_age_band";

export function ProfileSetupForm({ existingHap, existingProfile }: Props) {
  const router = useRouter();
  const isEditing = existingHap !== null;

  const [ageBand, setAgeBand] = useState<AgeBand | "">(
    existingHap?.ageBand ?? "",
  );
  const [city, setCity] = useState(existingHap?.city ?? "");
  const [neighborhood, setNeighborhood] = useState(existingHap?.neighborhood ?? "");
  const [displayName, setDisplayName] = useState(existingProfile?.displayName ?? "");
  const [bio, setBio] = useState(existingProfile?.bio ?? "");
  const [languages, setLanguages] = useState<string[]>(
    existingProfile?.languagesSpoken ?? ["en"],
  );
  const [emergencyContact, setEmergencyContact] = useState("");
  const [isOpenToRomance, setIsOpenToRomance] = useState(
    existingProfile?.isOpenToRomanticInterest ?? false,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);

  // Pull age band out of sessionStorage on first mount (set by /signup gate).
  useEffect(() => {
    if (existingHap || ageBand) return;
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem(SESSION_AGE_KEY);
    if (stored && (AGE_BANDS as readonly string[]).includes(stored)) {
      setAgeBand(stored as AgeBand);
    }
  }, [existingHap, ageBand]);

  const citySuggestions = useMemo(() => suggestCities(city, 6), [city]);

  function toggleLanguage(code: string) {
    setLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ageBand) {
      setError("Pick an age band before continuing.");
      return;
    }
    if (displayName.trim().length < 2 || displayName.trim().length > 30) {
      setError("Display name must be 2–30 characters.");
      return;
    }
    if (city.trim().length === 0) {
      setError("City is required.");
      return;
    }
    if (languages.length === 0) {
      setError("Pick at least one language.");
      return;
    }
    if (bio.length > 200) {
      setError("Bio must be 200 characters or fewer.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageBand,
          city: city.trim(),
          neighborhood: neighborhood.trim() || null,
          displayName: displayName.trim(),
          bio: bio.trim() || null,
          languagesSpoken: languages,
          emergencyContact: emergencyContact.trim() || null,
          isOpenToRomanticInterest: isOpenToRomance,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Save failed (${res.status})`);
      }
      const json = (await res.json()) as { userId: string };
      sessionStorage.removeItem(SESSION_AGE_KEY);
      router.push(`/profile/${json.userId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSubmitting(false);
    }
  }

  const bioRemaining = 200 - bio.length;

  return (
    <form onSubmit={onSubmit} noValidate>
      <Section title="Basics">
        <Field
          label="Display name"
          help="This is what others see. We recommend not using your full real name."
          required
        >
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            minLength={2}
            maxLength={30}
            required
            style={inputStyle}
          />
        </Field>

        {!isEditing ? (
          <Field
            label="Age band"
            help="We never show your exact age. Required at signup so we can keep matches in compatible age ranges."
            required
          >
            <div style={radioRowStyle}>
              {AGE_BANDS.map((band) => (
                <label
                  key={band}
                  style={{
                    ...radioPillStyle,
                    borderColor: ageBand === band ? GOLD : "#2a2a2a",
                    background: ageBand === band ? "rgba(212,175,55,0.1)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="ageBand"
                    value={band}
                    checked={ageBand === band}
                    onChange={() => setAgeBand(band)}
                    style={hiddenRadioStyle}
                  />
                  {band}
                </label>
              ))}
            </div>
          </Field>
        ) : (
          <div style={readOnlyRowStyle}>
            <span style={{ color: MUTED }}>Age band</span>
            <strong style={{ color: PAPER }}>{ageBand}</strong>
          </div>
        )}

        <Field
          label="City"
          help="Start typing — pick from suggestions or enter your own."
          required
        >
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            list="hap-city-suggestions"
            required
            style={inputStyle}
          />
          <datalist id="hap-city-suggestions">
            {citySuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <Field
          label="Neighborhood"
          help="City-level neighborhood, not your exact street."
        >
          <input
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            maxLength={80}
            style={inputStyle}
          />
        </Field>
      </Section>

      <Section title="Languages you speak">
        <p style={helpStyle}>
          Pick every language you can hold a conversation in.
        </p>
        <div style={languageGridStyle} role="group" aria-label="Languages spoken">
          {LANGUAGES.map((lang) => {
            const checked = languages.includes(lang.code);
            return (
              <label
                key={lang.code}
                style={{
                  ...langPillStyle,
                  borderColor: checked ? GOLD : "#2a2a2a",
                  background: checked ? "rgba(212,175,55,0.1)" : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleLanguage(lang.code)}
                  style={hiddenRadioStyle}
                />
                {lang.label}
              </label>
            );
          })}
        </div>
      </Section>

      <Section title="Bio">
        <Field
          label="Tell potential partners what you're hoping to do with them"
          help={`${bioRemaining} characters left.`}
        >
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 200))}
            maxLength={200}
            rows={4}
            style={textareaStyle}
          />
        </Field>
      </Section>

      <Section title="Optional safety + matching settings">
        <Field
          label="Emergency contact"
          help="We never share this. Used only if you report a serious incident. Encrypted at rest."
        >
          <input
            type="text"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Name + phone or email"
            maxLength={200}
            style={inputStyle}
          />
        </Field>

        <label style={{ ...checkboxRowStyle, marginTop: 4 }}>
          <input
            type="checkbox"
            checked={isOpenToRomance}
            onChange={(e) => setIsOpenToRomance(e.target.checked)}
            style={{ width: 18, height: 18, accentColor: GOLD }}
          />
          <span>
            <strong style={{ color: PAPER }}>I'm open to romantic interest</strong>
            <br />
            <span style={{ color: MUTED, fontSize: 12, lineHeight: 1.4 }}>
              Some activities lead to friendship; some lead to dating. Both are
              fine. We only show you potential romantic matches if both parties
              have this enabled.
            </span>
          </span>
        </label>

        <p style={photoNoteStyle}>
          Photo upload arrives in Phase 2 with the activity selection flow. Your
          photo will be blurred by default and only unblurred for matched
          partners after both sides accept contact-share.
        </p>
      </Section>

      <div ref={liveRegionRef} role="alert" aria-live="polite" style={{ minHeight: 24 }}>
        {error ? <span style={errorStyle}>{error}</span> : null}
      </div>

      <button type="submit" disabled={submitting} style={ctaStyle}>
        {submitting ? "Saving…" : isEditing ? "Save changes" : "Create profile"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  help,
  required,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={fieldStyle}>
      <span style={{ color: PAPER, fontSize: 14, fontWeight: 500 }}>
        {label}
        {required ? <span style={{ color: GOLD, marginLeft: 4 }}>*</span> : null}
      </span>
      {children}
      {help ? <span style={helpStyle}>{help}</span> : null}
    </label>
  );
}

const sectionStyle: React.CSSProperties = {
  marginBottom: 24,
  paddingBottom: 20,
  borderBottom: "1px solid #1f1f1f",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: 16,
  color: PAPER,
  fontWeight: 600,
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 44,
  padding: "10px 12px",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  background: "#0f0f0f",
  color: PAPER,
  fontSize: 15,
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 96,
  resize: "vertical",
  lineHeight: 1.5,
};

const helpStyle: React.CSSProperties = {
  color: MUTED,
  fontSize: 12,
  lineHeight: 1.4,
};

const radioRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const radioPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: 64,
  minHeight: 44,
  padding: "8px 14px",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  cursor: "pointer",
  color: PAPER,
  fontSize: 14,
};

const hiddenRadioStyle: React.CSSProperties = {
  position: "absolute",
  opacity: 0,
  pointerEvents: "none",
  width: 0,
  height: 0,
};

const readOnlyRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 12px",
  border: "1px solid #1f1f1f",
  borderRadius: 8,
  marginBottom: 14,
};

const languageGridStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const langPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  padding: "6px 12px",
  border: "1px solid #2a2a2a",
  borderRadius: 18,
  cursor: "pointer",
  color: PAPER,
  fontSize: 13,
};

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: "12px 14px",
  border: "1px solid #2a2a2a",
  borderRadius: 10,
  cursor: "pointer",
};

const photoNoteStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "10px 12px",
  border: "1px dashed #2a2a2a",
  borderRadius: 8,
  color: MUTED,
  fontSize: 12,
  lineHeight: 1.5,
};

const errorStyle: React.CSSProperties = {
  color: "#ff8a8a",
  fontSize: 13,
};

const ctaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  background: GOLD,
  color: "#0a0a0a",
  border: 0,
  borderRadius: 10,
  fontWeight: 600,
  fontSize: 16,
  cursor: "pointer",
  marginTop: 8,
};
