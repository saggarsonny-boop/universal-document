"use client";

// Single-page edit form for one of the user's activities. Loads the row
// via listMyActivities() and filters to the requested id (so deactivated
// rows return notFound at the UI level, not just at the API layer).
//
// All four schema fields are editable in one screen — skill, frequency,
// time windows, location radius, plus optional notes. Submitting calls
// PATCH /api/users/me/activities/[id] with only the changed fields.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { type Strings } from "../../../../_lib/strings";
import { useStrings } from "../../../../_lib/useStrings";
import {
  CARD,
  ERROR_BOX,
  HELP,
  LABEL,
  LEAD,
  PRIMARY_BTN,
  SECONDARY_BTN,
  TEXTAREA,
  TILE,
  TILE_SELECTED,
  TITLE,
  TOKENS,
} from "../../../../_lib/activityFormStyles";
import {
  isApiError,
  listMyActivities,
  patchMyActivity,
  type UserActivity,
} from "../../../../_lib/activitiesClient";
import {
  FREQUENCIES,
  LOCATION_RADII,
  SKILL_LEVELS,
  TIME_WINDOWS,
  type Frequency,
  type LocationRadius,
  type SkillLevel,
  type TimeWindow,
} from "@/lib/validation/activity";

const NOTES_UI_MAX = 200;

type LoadState =
  | { kind: "loading" }
  | { kind: "ready"; activity: UserActivity }
  | { kind: "missing" }
  | { kind: "error"; message: string };

export function EditActivityForm({ id }: { id: string }) {
  const s = useStrings();
  const router = useRouter();
  const [load, setLoad] = useState<LoadState>({ kind: "loading" });

  const [skillLevel, setSkillLevel] = useState<SkillLevel | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
  const [locationRadius, setLocationRadius] = useState<LocationRadius | null>(null);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMyActivities()
      .then((list) => {
        if (cancelled) return;
        const a = list.find((x) => x.id === id);
        if (!a) {
          setLoad({ kind: "missing" });
          return;
        }
        setLoad({ kind: "ready", activity: a });
        setSkillLevel(a.skillLevel);
        setFrequency(a.frequency);
        setTimeWindows(a.timeWindows);
        setLocationRadius(a.locationRadius);
        setNotes(a.notes ?? "");
      })
      .catch(() => {
        if (cancelled) return;
        setLoad({ kind: "error", message: s.errors.couldNotLoad });
      });
    return () => {
      cancelled = true;
    };
  }, [id, s.errors.couldNotLoad]);

  // Compute the patch payload — only changed fields are sent. PATCH rejects
  // an empty body, so the submit button is disabled until at least one
  // field differs from the loaded activity.
  const patch = useMemo(() => {
    if (load.kind !== "ready") return {};
    const a = load.activity;
    const out: Partial<{
      skillLevel: SkillLevel;
      frequency: Frequency;
      timeWindows: TimeWindow[];
      locationRadius: LocationRadius;
      notes: string | null;
    }> = {};
    if (skillLevel && skillLevel !== a.skillLevel) out.skillLevel = skillLevel;
    if (frequency && frequency !== a.frequency) out.frequency = frequency;
    if (locationRadius && locationRadius !== a.locationRadius)
      out.locationRadius = locationRadius;
    const sortedNew = [...timeWindows].sort();
    const sortedOld = [...a.timeWindows].sort();
    if (
      sortedNew.length !== sortedOld.length ||
      sortedNew.some((w, i) => w !== sortedOld[i])
    ) {
      out.timeWindows = timeWindows;
    }
    const newNotes = notes.trim().length === 0 ? null : notes.trim();
    if (newNotes !== a.notes) out.notes = newNotes;
    return out;
  }, [load, skillLevel, frequency, timeWindows, locationRadius, notes]);

  const dirty = Object.keys(patch).length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await patchMyActivity(id, patch);
      router.push("/profile/activities");
    } catch (err) {
      if (isApiError(err) && err.errors && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else {
        setError(s.errors.couldNotSave);
      }
      setSubmitting(false);
    }
  }

  if (load.kind === "loading") {
    return (
      <p style={{ ...HELP, padding: 24, textAlign: "center" }} aria-live="polite">···</p>
    );
  }

  if (load.kind === "missing") {
    return (
      <>
        <h1 style={TITLE}>Not found</h1>
        <p style={LEAD}>This activity isn&rsquo;t on your list — it may have been removed.</p>
        <button
          type="button"
          onClick={() => router.push("/profile/activities")}
          style={PRIMARY_BTN}
        >
          ← Back to your activities
        </button>
      </>
    );
  }

  if (load.kind === "error") {
    return (
      <>
        <h1 style={TITLE}>Couldn&rsquo;t load</h1>
        <div role="alert" style={ERROR_BOX}>
          {load.message}
        </div>
      </>
    );
  }

  const a = load.activity;
  const activityName =
    (s.activities as Record<string, string>)[a.slug] ?? a.displayName;
  const remaining = NOTES_UI_MAX - notes.length;

  return (
    <form onSubmit={onSubmit} noValidate>
      <header>
        <h1 style={TITLE}>{activityName}</h1>
        <p style={LEAD}>{s.addActivity.lead}</p>
      </header>

      {error && (
        <div role="alert" style={ERROR_BOX}>
          {error}
        </div>
      )}

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>{s.skillLevel.label}</legend>
        <div role="radiogroup" aria-label={s.skillLevel.label}>
          {SKILL_LEVELS.map((opt) => {
            const selected = skillLevel === opt;
            const labels: Record<SkillLevel, string> = {
              beginner: s.skillLevel.beginner,
              intermediate: s.skillLevel.intermediate,
              advanced: s.skillLevel.advanced,
              any: s.skillLevel.any,
            };
            return (
              <label key={opt} style={selected ? TILE_SELECTED : TILE}>
                <input
                  type="radio"
                  name="skillLevel"
                  value={opt}
                  checked={selected}
                  onChange={() => setSkillLevel(opt)}
                  style={radioStyle}
                />
                <span style={{ marginLeft: 8 }}>{labels[opt]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>{s.frequency.label}</legend>
        <div role="radiogroup" aria-label={s.frequency.label}>
          {FREQUENCIES.map((opt) => {
            const selected = frequency === opt;
            const labels: Record<Frequency, string> = {
              one_time: s.frequency.oneTime,
              weekly: s.frequency.weekly,
              flexible: s.frequency.flexible,
            };
            return (
              <label key={opt} style={selected ? TILE_SELECTED : TILE}>
                <input
                  type="radio"
                  name="frequency"
                  value={opt}
                  checked={selected}
                  onChange={() => setFrequency(opt)}
                  style={radioStyle}
                />
                <span style={{ marginLeft: 8 }}>{labels[opt]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>{s.timeWindow.label}</legend>
        <p style={HELP}>Pick all that work for you.</p>
        <div>
          {TIME_WINDOWS.map((w) => {
            const selected = timeWindows.includes(w);
            const labels: Record<TimeWindow, string> = {
              weekday_morning: s.timeWindow.weekdayMornings,
              weekday_afternoon: s.timeWindow.weekdayAfternoons,
              weekday_evening: s.timeWindow.weekdayEvenings,
              weekend_morning: s.timeWindow.weekendMornings,
              weekend_afternoon: s.timeWindow.weekendAfternoons,
              weekend_evening: s.timeWindow.weekendEvenings,
              late_night: "Late nights",
            };
            return (
              <label key={w} style={selected ? TILE_SELECTED : TILE}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    setTimeWindows((prev) =>
                      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w],
                    )
                  }
                  style={checkboxStyle}
                  aria-label={labels[w]}
                />
                <span style={{ marginLeft: 8 }}>{labels[w]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset style={fieldsetStyle}>
        <legend style={legendStyle}>{s.radius.label}</legend>
        <div role="radiogroup" aria-label={s.radius.label}>
          {LOCATION_RADII.map((opt) => {
            const selected = locationRadius === opt;
            const labels: Record<LocationRadius, string> = {
              walk: s.radius.walk,
              bike: s.radius.bike,
              transit: s.radius.transit,
              drive: s.radius.drive,
            };
            return (
              <label key={opt} style={selected ? TILE_SELECTED : TILE}>
                <input
                  type="radio"
                  name="locationRadius"
                  value={opt}
                  checked={selected}
                  onChange={() => setLocationRadius(opt)}
                  style={radioStyle}
                />
                <span style={{ marginLeft: 8 }}>{labels[opt]}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div style={CARD}>
        <label htmlFor="edit-notes" style={LABEL}>
          {s.addActivity.noteLabel}
        </label>
        <p style={HELP}>{s.addActivity.noteHelp}</p>
        <textarea
          id="edit-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, NOTES_UI_MAX))}
          maxLength={NOTES_UI_MAX}
          style={TEXTAREA}
          aria-describedby="edit-notes-counter"
        />
        <p id="edit-notes-counter" style={HELP} aria-live="polite">
          {remaining} / {NOTES_UI_MAX}
        </p>
      </div>

      <div style={navRowStyle}>
        <button
          type="button"
          onClick={() => router.push("/profile/activities")}
          style={SECONDARY_BTN}
          disabled={submitting}
        >
          {s.addActivity.cancel}
        </button>
        <button
          type="submit"
          disabled={!dirty || submitting}
          style={{
            ...PRIMARY_BTN,
            opacity: !dirty || submitting ? 0.5 : 1,
            cursor: !dirty || submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? s.addActivity.submitting : s.addActivity.save}
        </button>
      </div>
    </form>
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
  marginTop: 24,
  alignItems: "center",
  justifyContent: "space-between",
};

const radioStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  accentColor: TOKENS.gold,
  cursor: "pointer",
};

const checkboxStyle: React.CSSProperties = {
  width: 20,
  height: 20,
  accentColor: TOKENS.gold,
  cursor: "pointer",
};
