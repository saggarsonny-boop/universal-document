"use client";

// Client list of the user's activities. Fetches via listMyActivities() on
// mount, renders cards, supports deactivate (soft-delete via DELETE) and
// links each card to the edit page.
//
// Localised copy comes from useStrings(). Activity display names use the
// activity slug as the locale key — every taxonomy slug is a key under
// `t.activities.<slug>`. Categories use `t.categories.<category>`.

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { type Strings } from "../../_lib/strings";
import { useStrings } from "../../_lib/useStrings";
import {
  CARD,
  CHIP,
  DANGER_BTN,
  ERROR_BOX,
  HELP,
  PRIMARY_BTN,
  SECONDARY_BTN,
  TOKENS,
} from "../../_lib/activityFormStyles";
import {
  deactivateMyActivity,
  isApiError,
  listMyActivities,
  type UserActivity,
} from "../../_lib/activitiesClient";

const ADD_NEW_HREF = "/profile/activities/new";

export function MyActivitiesList() {
  const s = useStrings();
  const [activities, setActivities] = useState<UserActivity[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      const list = await listMyActivities();
      setActivities(list);
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        // Profile not set up yet — bounce to setup.
        window.location.href = "/profile/setup";
        return;
      }
      setError(s.errors.couldNotLoad);
    }
  }, [s.errors.couldNotLoad]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onDeactivate(id: string) {
    setBusyId(id);
    setError(null);
    try {
      await deactivateMyActivity(id);
      setConfirmId(null);
      await reload();
    } catch {
      setError(s.errors.couldNotSave);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-label={s.myActivities.title}>
      <div style={addRowStyle}>
        <Link href={ADD_NEW_HREF} style={primaryLinkStyle} aria-label={s.addActivity.title}>
          {s.myActivities.addAnother}
        </Link>
      </div>

      {error && (
        <div role="alert" style={ERROR_BOX}>
          {error}
        </div>
      )}

      {activities === null && !error && (
        <p style={{ ...HELP, textAlign: "center", padding: 24 }} aria-live="polite">
          {/* Loading — kept terse so the empty-state copy lands cleanly when activities is [] */}
          ···
        </p>
      )}

      {activities !== null && activities.length === 0 && (
        <EmptyState s={s} />
      )}

      {activities !== null && activities.length > 0 && (
        <ul style={listStyle} aria-label={s.myActivities.title}>
          {activities.map((a) => (
            <li key={a.id}>
              <ActivityCard
                activity={a}
                s={s}
                busy={busyId === a.id}
                confirming={confirmId === a.id}
                onAskDeactivate={() => setConfirmId(a.id)}
                onCancelDeactivate={() => setConfirmId(null)}
                onConfirmDeactivate={() => onDeactivate(a.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ActivityCard({
  activity,
  s,
  busy,
  confirming,
  onAskDeactivate,
  onCancelDeactivate,
  onConfirmDeactivate,
}: {
  activity: UserActivity;
  s: Strings;
  busy: boolean;
  confirming: boolean;
  onAskDeactivate: () => void;
  onCancelDeactivate: () => void;
  onConfirmDeactivate: () => void;
}) {
  const activityName =
    (s.activities as Record<string, string>)[activity.slug] ?? activity.displayName;
  const categoryName =
    (s.categories as Record<string, string>)[activity.category] ?? activity.category;
  const skill = s.skillLevel[activity.skillLevel as keyof typeof s.skillLevel];
  const frequency = renderFrequency(activity.frequency, s);
  const radius = s.radius[activity.locationRadius as keyof typeof s.radius];

  return (
    <article style={CARD} aria-labelledby={`act-${activity.id}-name`}>
      <h2 id={`act-${activity.id}-name`} style={cardTitleStyle}>
        {activityName}
      </h2>
      <div style={chipRowStyle}>
        <span style={CHIP}>{categoryName}</span>
        <span style={CHIP}>{skill}</span>
        <span style={CHIP}>{frequency}</span>
        <span style={CHIP}>{radius}</span>
      </div>
      {activity.timeWindows.length > 0 && (
        <p style={timeRowStyle}>
          {activity.timeWindows
            .map((w) => renderTimeWindow(w, s))
            .join(" · ")}
        </p>
      )}
      {activity.notes && <p style={noteStyle}>{activity.notes}</p>}

      {!confirming ? (
        <div style={btnRowStyle}>
          <Link
            href={`/profile/activities/${encodeURIComponent(activity.id)}/edit`}
            style={secondaryLinkStyle}
            aria-label={`${s.addActivity.edit} — ${activityName}`}
          >
            {s.addActivity.edit}
          </Link>
          <button
            type="button"
            onClick={onAskDeactivate}
            style={DANGER_BTN}
            aria-label={`${s.addActivity.remove} — ${activityName}`}
          >
            {s.addActivity.remove}
          </button>
        </div>
      ) : (
        <div role="alertdialog" aria-labelledby={`act-${activity.id}-name`} style={confirmBoxStyle}>
          <p style={{ ...HELP, color: TOKENS.paper, marginBottom: 10 }}>
            {s.addActivity.removeConfirm}
          </p>
          <div style={btnRowStyle}>
            <button
              type="button"
              onClick={onConfirmDeactivate}
              disabled={busy}
              style={{ ...DANGER_BTN, opacity: busy ? 0.6 : 1 }}
            >
              {busy ? s.addActivity.submitting : s.addActivity.remove}
            </button>
            <button type="button" onClick={onCancelDeactivate} style={SECONDARY_BTN}>
              {s.addActivity.cancel}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function EmptyState({ s }: { s: Strings }) {
  return (
    <div style={emptyStyle}>
      <p style={{ marginBottom: 16, color: TOKENS.paper }}>{s.empty.noActivities}</p>
      <Link href={ADD_NEW_HREF} style={primaryLinkStyle}>
        {s.addActivity.title}
      </Link>
    </div>
  );
}

function renderFrequency(value: string, s: Strings): string {
  // Schema uses snake_case (one_time); locale uses camelCase (oneTime).
  // Map across the two; weekly/flexible match by name.
  if (value === "one_time") return s.frequency.oneTime;
  if (value === "weekly") return s.frequency.weekly;
  if (value === "flexible") return s.frequency.flexible;
  return value;
}

function renderTimeWindow(value: string, s: Strings): string {
  // Schema uses snake_case; locale keys are camelCase. Mapping table keeps
  // the rendering deterministic regardless of new windows added later.
  const map: Record<string, string> = {
    weekday_morning: s.timeWindow.weekdayMornings,
    weekday_afternoon: s.timeWindow.weekdayAfternoons,
    weekday_evening: s.timeWindow.weekdayEvenings,
    weekend_morning: s.timeWindow.weekendMornings,
    weekend_afternoon: s.timeWindow.weekendAfternoons,
    weekend_evening: s.timeWindow.weekendEvenings,
    late_night: s.timeWindow.flexible, // no late_night key in locale; fall back to flexible label
  };
  return map[value] ?? value;
}

const addRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: 16,
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  padding: 0,
  margin: 0,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 600,
  color: TOKENS.paper,
  margin: "0 0 8px",
  lineHeight: 1.3,
};

const chipRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  marginBottom: 6,
};

const timeRowStyle: React.CSSProperties = {
  fontSize: 12,
  color: TOKENS.muted,
  margin: "6px 0 0",
  lineHeight: 1.5,
};

const noteStyle: React.CSSProperties = {
  fontSize: 13,
  color: TOKENS.paper,
  fontStyle: "italic",
  margin: "10px 0 0",
  lineHeight: 1.5,
};

const btnRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 14,
};

const confirmBoxStyle: React.CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  background: TOKENS.bgCardActive,
  border: `1px solid ${TOKENS.gold}`,
  borderRadius: 8,
};

const emptyStyle: React.CSSProperties = {
  padding: "32px 16px",
  textAlign: "center",
  background: TOKENS.bgCard,
  border: `1px dashed ${TOKENS.border}`,
  borderRadius: 12,
};

const primaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "10px 18px",
  fontSize: 15,
  fontWeight: 600,
  color: TOKENS.ink,
  background: TOKENS.gold,
  borderRadius: 8,
  textDecoration: "none",
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "10px 18px",
  fontSize: 15,
  color: TOKENS.paper,
  background: "transparent",
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
  textDecoration: "none",
};
