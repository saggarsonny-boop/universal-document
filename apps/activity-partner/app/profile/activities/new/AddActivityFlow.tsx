"use client";

// Multi-step add-an-activity flow. Six steps for the standard path:
//   1. Pick activity (search + browse by category)
//   2. Skill level
//   3. Frequency
//   4. Time windows (multi-select)
//   5. Location radius
//   6. Optional notes
// Plus a side-path on Step 1: "Don't see your activity?" → request flow
// (slug suggestion, display name, category, justification → POST /api/activities/request).
//
// State management: a single useState for the in-progress draft. Step
// transitions guard the "Continue" button so users can't skip a required
// field. Validation mirrors lib/validation/activity.ts; the API enforces
// the same rules server-side.
//
// Accessibility: each step is a <fieldset><legend>; the live region announces
// step changes; tile-style radios + checkboxes keep touch targets ≥ 44px.

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type Strings } from "../../../_lib/strings";
import { useStrings } from "../../../_lib/useStrings";
import {
  CARD,
  ERROR_BOX,
  HELP,
  INPUT,
  LABEL,
  LEAD,
  PRIMARY_BTN,
  SECONDARY_BTN,
  STEP_HEADER,
  SUCCESS_BOX,
  TILE,
  TILE_SELECTED,
  TITLE,
  TOKENS,
  TEXTAREA,
} from "../../../_lib/activityFormStyles";
import {
  addMyActivity,
  isApiError,
  listTaxonomy,
  requestNewActivity,
  type TaxonomyActivity,
} from "../../../_lib/activitiesClient";
import {
  CATEGORIES,
  FREQUENCIES,
  LOCATION_RADII,
  SKILL_LEVELS,
  TIME_WINDOWS,
  type Category,
  type Frequency,
  type LocationRadius,
  type SkillLevel,
  type TimeWindow,
} from "@/lib/validation/activity";

type Mode = "add" | "request";

type Draft = {
  activityId: string | null;
  activitySlug: string | null;
  skillLevel: SkillLevel | null;
  frequency: Frequency | null;
  timeWindows: TimeWindow[];
  locationRadius: LocationRadius | null;
  notes: string;
};

type RequestDraft = {
  slug: string;
  displayName: string;
  category: Category | "";
  justification: string;
};

const NOTES_UI_MAX = 200; // per spec; API allows 500

export function AddActivityFlow() {
  const s = useStrings();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("add");

  return mode === "add" ? (
    <AddPath
      s={s}
      onSwitchToRequest={() => setMode("request")}
      onDone={() => router.push("/profile/activities")}
    />
  ) : (
    <RequestPath
      s={s}
      onBack={() => setMode("add")}
      onDone={() => router.push("/profile/activities")}
    />
  );
}

// -----------------------------------------------------------------------
// Add-an-activity path (6 steps)
// -----------------------------------------------------------------------

function AddPath({
  s,
  onSwitchToRequest,
  onDone,
}: {
  s: Strings;
  onSwitchToRequest: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [draft, setDraft] = useState<Draft>({
    activityId: null,
    activitySlug: null,
    skillLevel: null,
    frequency: null,
    timeWindows: [],
    locationRadius: null,
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Announce the current step to screen readers when it changes.
    if (liveRef.current) liveRef.current.textContent = `Step ${step} of 6`;
  }, [step]);

  function patchDraft(p: Partial<Draft>) {
    setDraft((prev) => ({ ...prev, ...p }));
  }

  async function onSubmit() {
    if (
      !draft.activityId ||
      !draft.skillLevel ||
      !draft.frequency ||
      draft.timeWindows.length === 0 ||
      !draft.locationRadius
    ) {
      setError(s.errors.required);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await addMyActivity({
        activityId: draft.activityId,
        skillLevel: draft.skillLevel,
        frequency: draft.frequency,
        timeWindows: draft.timeWindows,
        locationRadius: draft.locationRadius,
        notes: draft.notes.trim().length === 0 ? null : draft.notes.trim(),
      });
      onDone();
    } catch (err) {
      if (isApiError(err) && err.code === "ACTIVITY_NOT_AVAILABLE") {
        setError(s.errors.alreadyAdded);
      } else if (isApiError(err) && err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(s.errors.couldNotSave);
      }
      setSubmitting(false);
    }
  }

  return (
    <>
      <header>
        <p style={STEP_HEADER}>Step {step} of 6</p>
        <h1 style={TITLE}>{s.addActivity.title}</h1>
        <p style={LEAD}>{s.addActivity.lead}</p>
      </header>

      <div ref={liveRef} aria-live="polite" style={visuallyHidden} />

      {error && (
        <div role="alert" style={ERROR_BOX}>
          {error}
        </div>
      )}

      {step === 1 && (
        <Step1Activity
          s={s}
          selectedId={draft.activityId}
          onPick={(id, slug) => {
            patchDraft({ activityId: id, activitySlug: slug });
            setStep(2);
          }}
          onSwitchToRequest={onSwitchToRequest}
        />
      )}

      {step === 2 && (
        <Step2Skill
          s={s}
          value={draft.skillLevel}
          onPick={(skillLevel) => {
            patchDraft({ skillLevel });
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <Step3Frequency
          s={s}
          value={draft.frequency}
          onPick={(frequency) => {
            patchDraft({ frequency });
            setStep(4);
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <Step4TimeWindows
          s={s}
          value={draft.timeWindows}
          onChange={(timeWindows) => patchDraft({ timeWindows })}
          onContinue={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <Step5Radius
          s={s}
          value={draft.locationRadius}
          onPick={(locationRadius) => {
            patchDraft({ locationRadius });
            setStep(6);
          }}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && (
        <Step6Notes
          s={s}
          value={draft.notes}
          onChange={(notes) => patchDraft({ notes })}
          submitting={submitting}
          onSubmit={onSubmit}
          onBack={() => setStep(5)}
        />
      )}
    </>
  );
}

// Step 1: pick activity from taxonomy. Loads on mount, supports search +
// category browse. Each row is a button — keyboard accessible.
function Step1Activity({
  s,
  selectedId,
  onPick,
  onSwitchToRequest,
}: {
  s: Strings;
  selectedId: string | null;
  onPick: (id: string, slug: string) => void;
  onSwitchToRequest: () => void;
}) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyActivity[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");

  useEffect(() => {
    let cancelled = false;
    listTaxonomy()
      .then((list) => {
        if (!cancelled) setTaxonomy(list);
      })
      .catch(() => {
        if (!cancelled) setLoadError(s.errors.couldNotLoad);
      });
    return () => {
      cancelled = true;
    };
  }, [s.errors.couldNotLoad]);

  const filtered = useMemo(() => {
    if (!taxonomy) return [];
    const q = query.trim().toLowerCase();
    return taxonomy.filter((a) => {
      if (activeCategory !== "all" && a.category !== activeCategory) return false;
      if (q.length === 0) return true;
      const localizedName =
        ((s.activities as Record<string, string>)[a.slug] ?? a.displayName).toLowerCase();
      return localizedName.includes(q) || a.slug.toLowerCase().includes(q);
    });
  }, [taxonomy, query, activeCategory, s.activities]);

  return (
    <fieldset style={fieldsetStyle}>
      <legend style={legendStyle}>{s.addActivity.stepActivity}</legend>

      <label htmlFor="activity-search" style={visuallyHidden}>
        Search activities
      </label>
      <input
        id="activity-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        style={INPUT}
        autoComplete="off"
        aria-controls="activity-list"
      />

      <div role="tablist" aria-label="Browse by category" style={catRowStyle}>
        <CategoryPill
          label="All"
          active={activeCategory === "all"}
          onClick={() => setActiveCategory("all")}
        />
        {CATEGORIES.map((c) => (
          <CategoryPill
            key={c}
            label={(s.categories as Record<string, string>)[c] ?? c}
            active={activeCategory === c}
            onClick={() => setActiveCategory(c)}
          />
        ))}
      </div>

      {loadError && (
        <div role="alert" style={ERROR_BOX}>
          {loadError}
        </div>
      )}

      {taxonomy === null && !loadError && (
        <p style={{ ...HELP, padding: 16, textAlign: "center" }} aria-live="polite">···</p>
      )}

      {taxonomy !== null && (
        <ul id="activity-list" style={listStyle} aria-label={s.addActivity.activityLabel}>
          {filtered.length === 0 && (
            <li>
              <p style={{ ...HELP, padding: 16 }}>
                {activeCategory === "all"
                  ? s.empty.noActivities
                  : s.empty.noActivitiesInCategory}
              </p>
            </li>
          )}
          {filtered.map((a) => {
            const name =
              (s.activities as Record<string, string>)[a.slug] ?? a.displayName;
            const cat =
              (s.categories as Record<string, string>)[a.category] ?? a.category;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => onPick(a.id, a.slug)}
                  style={
                    selectedId === a.id ? activityRowSelectedStyle : activityRowStyle
                  }
                  aria-pressed={selectedId === a.id}
                >
                  <span style={{ fontWeight: 600 }}>{name}</span>
                  <span style={{ fontSize: 11, color: TOKENS.muted, marginLeft: 8 }}>
                    {cat}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p style={{ ...HELP, marginTop: 16 }}>{s.addActivity.activityHelp}</p>
      <button type="button" onClick={onSwitchToRequest} style={requestLinkStyle}>
        {s.requestActivity.title} →
      </button>
    </fieldset>
  );
}

function Step2Skill({
  s,
  value,
  onPick,
  onBack,
}: {
  s: Strings;
  value: SkillLevel | null;
  onPick: (v: SkillLevel) => void;
  onBack: () => void;
}) {
  const labels: Record<SkillLevel, string> = {
    beginner: s.skillLevel.beginner,
    intermediate: s.skillLevel.intermediate,
    advanced: s.skillLevel.advanced,
    any: s.skillLevel.any,
  };
  return (
    <RadioStep
      legend={s.skillLevel.label}
      options={SKILL_LEVELS as readonly SkillLevel[]}
      value={value}
      labels={labels}
      onPick={onPick}
      onBack={onBack}
      name="skillLevel"
    />
  );
}

function Step3Frequency({
  s,
  value,
  onPick,
  onBack,
}: {
  s: Strings;
  value: Frequency | null;
  onPick: (v: Frequency) => void;
  onBack: () => void;
}) {
  const labels: Record<Frequency, string> = {
    one_time: s.frequency.oneTime,
    weekly: s.frequency.weekly,
    flexible: s.frequency.flexible,
  };
  return (
    <RadioStep
      legend={s.frequency.label}
      options={FREQUENCIES as readonly Frequency[]}
      value={value}
      labels={labels}
      onPick={onPick}
      onBack={onBack}
      name="frequency"
    />
  );
}

function Step4TimeWindows({
  s,
  value,
  onChange,
  onContinue,
  onBack,
}: {
  s: Strings;
  value: TimeWindow[];
  onChange: (v: TimeWindow[]) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const labels: Record<TimeWindow, string> = {
    weekday_morning: s.timeWindow.weekdayMornings,
    weekday_afternoon: s.timeWindow.weekdayAfternoons,
    weekday_evening: s.timeWindow.weekdayEvenings,
    weekend_morning: s.timeWindow.weekendMornings,
    weekend_afternoon: s.timeWindow.weekendAfternoons,
    weekend_evening: s.timeWindow.weekendEvenings,
    late_night: "Late nights",
  };

  function toggle(w: TimeWindow) {
    onChange(
      value.includes(w) ? value.filter((x) => x !== w) : [...value, w],
    );
  }

  return (
    <fieldset style={fieldsetStyle}>
      <legend style={legendStyle}>{s.timeWindow.label}</legend>
      <p style={HELP}>Pick all that work for you.</p>
      <div style={tileGridStyle}>
        {(TIME_WINDOWS as readonly TimeWindow[]).map((w) => {
          const selected = value.includes(w);
          return (
            <label
              key={w}
              style={selected ? TILE_SELECTED : TILE}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggle(w)}
                style={checkboxStyle}
                aria-label={labels[w]}
              />
              <span style={{ marginLeft: 8 }}>{labels[w]}</span>
            </label>
          );
        })}
      </div>

      <NavRow
        s={s}
        onBack={onBack}
        primaryLabel={s.addActivity.stepReview}
        onPrimary={onContinue}
        primaryDisabled={value.length === 0}
      />
    </fieldset>
  );
}

function Step5Radius({
  s,
  value,
  onPick,
  onBack,
}: {
  s: Strings;
  value: LocationRadius | null;
  onPick: (v: LocationRadius) => void;
  onBack: () => void;
}) {
  const labels: Record<LocationRadius, string> = {
    walk: s.radius.walk,
    bike: s.radius.bike,
    transit: s.radius.transit,
    drive: s.radius.drive,
  };
  return (
    <RadioStep
      legend={s.radius.label}
      options={LOCATION_RADII as readonly LocationRadius[]}
      value={value}
      labels={labels}
      onPick={onPick}
      onBack={onBack}
      name="locationRadius"
    />
  );
}

function Step6Notes({
  s,
  value,
  onChange,
  submitting,
  onSubmit,
  onBack,
}: {
  s: Strings;
  value: string;
  onChange: (v: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const remaining = NOTES_UI_MAX - value.length;
  return (
    <fieldset style={fieldsetStyle}>
      <legend style={legendStyle}>{s.addActivity.noteLabel}</legend>
      <p style={HELP}>{s.addActivity.noteHelp}</p>
      <label htmlFor="notes" style={visuallyHidden}>
        {s.addActivity.noteLabel}
      </label>
      <textarea
        id="notes"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, NOTES_UI_MAX))}
        placeholder={s.addActivity.notePlaceholder}
        maxLength={NOTES_UI_MAX}
        style={TEXTAREA}
        aria-describedby="notes-counter"
      />
      <p id="notes-counter" style={HELP} aria-live="polite">
        {remaining} / {NOTES_UI_MAX}
      </p>

      <div style={{ ...navRowStyle, marginTop: 24 }}>
        <button type="button" onClick={onBack} style={SECONDARY_BTN} disabled={submitting}>
          ← Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          style={{ ...PRIMARY_BTN, opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? s.addActivity.submitting : s.addActivity.submit}
        </button>
      </div>
    </fieldset>
  );
}

// -----------------------------------------------------------------------
// Request-new-activity side path
// -----------------------------------------------------------------------

function RequestPath({
  s,
  onBack,
  onDone,
}: {
  s: Strings;
  onBack: () => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<RequestDraft>({
    slug: "",
    displayName: "",
    category: "",
    justification: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // As the user types a display name, suggest a camelCase slug.
  function suggestSlug(displayName: string): string {
    const cleaned = displayName.trim().replace(/[^a-zA-Z0-9 ]+/g, "");
    if (cleaned.length === 0) return "";
    const parts = cleaned.split(/\s+/);
    const head = parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
    const tail = parts
      .slice(1)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join("");
    return (head + tail).slice(0, 40);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!draft.slug || !draft.displayName || !draft.category || !draft.justification) {
      setError(s.errors.required);
      return;
    }
    setSubmitting(true);
    try {
      await requestNewActivity({
        slug: draft.slug,
        displayName: draft.displayName,
        category: draft.category,
        justification: draft.justification,
      });
      setSuccess(true);
    } catch (err) {
      if (isApiError(err) && err.code === "RATE_LIMITED") {
        setError("You can request one new activity every 7 days. Try again later.");
      } else if (isApiError(err) && err.code === "SLUG_TAKEN") {
        setError(s.errors.alreadyAdded);
      } else if (isApiError(err) && err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(s.errors.couldNotSave);
      }
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <h1 style={TITLE}>{s.requestActivity.successTitle}</h1>
        <div role="status" style={SUCCESS_BOX}>
          {s.requestActivity.successBody}
        </div>
        <p style={HELP} aria-live="polite">
          Your request will be reviewed within 7 days. We approve activities that fit
          our taxonomy of partner-eligible pursuits.
        </p>
        <div style={{ ...navRowStyle, marginTop: 24 }}>
          <button type="button" onClick={onDone} style={PRIMARY_BTN}>
            ← Back to your activities
          </button>
        </div>
      </>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <header>
        <h1 style={TITLE}>{s.requestActivity.title}</h1>
        <p style={LEAD}>{s.requestActivity.lead}</p>
      </header>

      {error && (
        <div role="alert" style={ERROR_BOX}>
          {error}
        </div>
      )}

      <div style={CARD}>
        <label htmlFor="req-name" style={LABEL}>
          {s.requestActivity.nameLabel}
        </label>
        <input
          id="req-name"
          type="text"
          value={draft.displayName}
          onChange={(e) => {
            const displayName = e.target.value;
            setDraft((p) => ({
              ...p,
              displayName,
              slug: p.slug && p.slug !== suggestSlug(p.displayName) ? p.slug : suggestSlug(displayName),
            }));
          }}
          placeholder={s.requestActivity.namePlaceholder}
          maxLength={60}
          style={INPUT}
          required
        />
      </div>

      <div style={CARD}>
        <label htmlFor="req-slug" style={LABEL}>
          Slug (used internally — must be camelCase)
        </label>
        <input
          id="req-slug"
          type="text"
          value={draft.slug}
          onChange={(e) =>
            setDraft((p) => ({
              ...p,
              slug: e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40),
            }))
          }
          maxLength={40}
          style={{ ...INPUT, fontFamily: "ui-monospace, SFMono-Regular, monospace" }}
          aria-describedby="req-slug-help"
          required
        />
        <p id="req-slug-help" style={HELP}>
          Auto-suggested from the activity name. You can edit it.
        </p>
      </div>

      <div style={CARD}>
        <label htmlFor="req-category" style={LABEL}>
          {s.requestActivity.categoryLabel}
        </label>
        <select
          id="req-category"
          value={draft.category}
          onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value as Category | "" }))}
          style={INPUT}
          required
        >
          <option value="">— pick one —</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {(s.categories as Record<string, string>)[c] ?? c}
            </option>
          ))}
        </select>
      </div>

      <div style={CARD}>
        <label htmlFor="req-justification" style={LABEL}>
          {s.requestActivity.justificationLabel}
        </label>
        <textarea
          id="req-justification"
          value={draft.justification}
          onChange={(e) => setDraft((p) => ({ ...p, justification: e.target.value.slice(0, 500) }))}
          placeholder={s.requestActivity.justificationPlaceholder}
          maxLength={500}
          style={TEXTAREA}
          aria-describedby="req-justification-help"
          required
        />
        <p id="req-justification-help" style={HELP}>
          {s.requestActivity.justificationHelp}
        </p>
      </div>

      <p style={HELP}>
        Your request will be reviewed within 7 days. We approve activities that fit
        our taxonomy of partner-eligible pursuits.
      </p>

      <div style={{ ...navRowStyle, marginTop: 24 }}>
        <button type="button" onClick={onBack} style={SECONDARY_BTN} disabled={submitting}>
          ← Back
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{ ...PRIMARY_BTN, opacity: submitting ? 0.6 : 1 }}
        >
          {submitting ? s.requestActivity.submitting : s.requestActivity.submit}
        </button>
      </div>
    </form>
  );
}

// -----------------------------------------------------------------------
// Shared subcomponents
// -----------------------------------------------------------------------

function RadioStep<T extends string>({
  legend,
  options,
  value,
  labels,
  onPick,
  onBack,
  name,
}: {
  legend: string;
  options: readonly T[];
  value: T | null;
  labels: Record<T, string>;
  onPick: (v: T) => void;
  onBack: () => void;
  name: string;
}) {
  return (
    <fieldset style={fieldsetStyle}>
      <legend style={legendStyle}>{legend}</legend>
      <div role="radiogroup" aria-label={legend}>
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <label key={opt} style={selected ? TILE_SELECTED : TILE}>
              <input
                type="radio"
                name={name}
                value={opt}
                checked={selected}
                onChange={() => onPick(opt)}
                style={radioStyle}
              />
              <span style={{ marginLeft: 8 }}>{labels[opt]}</span>
            </label>
          );
        })}
      </div>
      <div style={navRowStyle}>
        <button type="button" onClick={onBack} style={SECONDARY_BTN}>
          ← Back
        </button>
      </div>
    </fieldset>
  );
}

function NavRow({
  s,
  onBack,
  primaryLabel,
  onPrimary,
  primaryDisabled,
}: {
  s: Strings;
  onBack: () => void;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
}) {
  return (
    <div style={navRowStyle}>
      <button type="button" onClick={onBack} style={SECONDARY_BTN}>
        ← Back
      </button>
      <button
        type="button"
        onClick={onPrimary}
        disabled={primaryDisabled}
        style={{
          ...PRIMARY_BTN,
          opacity: primaryDisabled ? 0.5 : 1,
          cursor: primaryDisabled ? "not-allowed" : "pointer",
        }}
        aria-label={primaryLabel}
      >
        {primaryLabel} →
      </button>
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={active ? catPillActiveStyle : catPillStyle}
    >
      {label}
    </button>
  );
}

const fieldsetStyle: React.CSSProperties = {
  border: "none",
  padding: 0,
  margin: "0 0 24px",
};

const legendStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: TOKENS.paper,
  marginBottom: 12,
  padding: 0,
};

const navRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 16,
  alignItems: "center",
  justifyContent: "space-between",
};

const visuallyHidden: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

const catRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  margin: "12px 0",
};

const catPillStyle: React.CSSProperties = {
  minHeight: 36,
  padding: "6px 12px",
  fontSize: 12,
  color: TOKENS.muted,
  background: "transparent",
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 999,
  cursor: "pointer",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
};

const catPillActiveStyle: React.CSSProperties = {
  ...catPillStyle,
  color: TOKENS.ink,
  background: TOKENS.gold,
  borderColor: TOKENS.gold,
  fontWeight: 600,
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: "12px 0 0",
  maxHeight: 360,
  overflowY: "auto",
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
};

const activityRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  width: "100%",
  minHeight: 44,
  padding: "10px 14px",
  fontSize: 15,
  color: TOKENS.paper,
  background: "transparent",
  border: "none",
  borderBottom: `1px solid ${TOKENS.border}`,
  cursor: "pointer",
  textAlign: "left",
};

const activityRowSelectedStyle: React.CSSProperties = {
  ...activityRowStyle,
  background: TOKENS.bgCardActive,
};

const tileGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 0,
};

const checkboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  accentColor: TOKENS.gold,
  cursor: "pointer",
};

const radioStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  accentColor: TOKENS.gold,
  cursor: "pointer",
};

const requestLinkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 8,
  padding: "10px 0",
  fontSize: 13,
  color: TOKENS.gold,
  background: "none",
  border: "none",
  cursor: "pointer",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};
