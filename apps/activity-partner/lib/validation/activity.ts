// Validation for hap_user_activities + hap_activity_taxonomy inputs.
// Mirrors the Postgres CHECK constraints in db/schema/004 and 003 so we
// surface friendly errors instead of letting the DB reject. Also covers
// the time_windows array shape, which Postgres treats as a free TEXT[].

export const SKILL_LEVELS = ["beginner", "intermediate", "advanced", "any"] as const;
export type SkillLevel = (typeof SKILL_LEVELS)[number];

export const FREQUENCIES = ["one_time", "weekly", "flexible"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const LOCATION_RADII = ["walk", "bike", "transit", "drive"] as const;
export type LocationRadius = (typeof LOCATION_RADII)[number];

export const CATEGORIES = [
  "sport",
  "fitness",
  "creative",
  "intellectual",
  "outdoor",
  "social",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const TIME_WINDOWS = [
  "weekday_morning",
  "weekday_afternoon",
  "weekday_evening",
  "weekend_morning",
  "weekend_afternoon",
  "weekend_evening",
  "late_night",
] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

export const NOTES_MAX = 500;
export const REQUEST_JUSTIFICATION_MAX = 500;
export const REQUEST_DISPLAY_NAME_MAX = 60;
export const REQUEST_SLUG_MAX = 40;

export type ValidationError = { field: string; message: string };
export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationError[] };

function err(field: string, message: string): ValidationError {
  return { field, message };
}

export type UserActivityInput = {
  activityId: string;
  skillLevel: SkillLevel;
  frequency: Frequency;
  timeWindows: TimeWindow[];
  locationRadius: LocationRadius;
  notes: string | null;
};

export function validateUserActivity(raw: unknown): ValidationResult<UserActivityInput> {
  const errors: ValidationError[] = [];
  const body = (raw ?? {}) as Record<string, unknown>;

  const activityId = typeof body.activityId === "string" ? body.activityId.trim() : "";
  if (!activityId || !isUuid(activityId)) {
    errors.push(err("activityId", "must be a valid taxonomy id"));
  }

  const skillLevel = body.skillLevel;
  if (!isSkillLevel(skillLevel)) {
    errors.push(err("skillLevel", `must be one of: ${SKILL_LEVELS.join(", ")}`));
  }

  const frequency = body.frequency;
  if (!isFrequency(frequency)) {
    errors.push(err("frequency", `must be one of: ${FREQUENCIES.join(", ")}`));
  }

  const timeWindowsRaw = body.timeWindows;
  let timeWindows: TimeWindow[] = [];
  if (!Array.isArray(timeWindowsRaw) || timeWindowsRaw.length === 0) {
    errors.push(err("timeWindows", "pick at least one time window"));
  } else {
    const filtered = timeWindowsRaw.filter(isTimeWindow);
    if (filtered.length !== timeWindowsRaw.length) {
      errors.push(
        err("timeWindows", `unknown time window; valid: ${TIME_WINDOWS.join(", ")}`),
      );
    }
    timeWindows = Array.from(new Set(filtered));
  }

  const locationRadius = body.locationRadius;
  if (!isLocationRadius(locationRadius)) {
    errors.push(err("locationRadius", `must be one of: ${LOCATION_RADII.join(", ")}`));
  }

  let notes: string | null = null;
  if (body.notes !== undefined && body.notes !== null) {
    if (typeof body.notes !== "string") {
      errors.push(err("notes", "must be a string"));
    } else {
      const trimmed = body.notes.trim();
      if (trimmed.length > NOTES_MAX) {
        errors.push(err("notes", `must be ${NOTES_MAX} characters or fewer`));
      } else {
        notes = trimmed.length === 0 ? null : trimmed;
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      activityId,
      skillLevel: skillLevel as SkillLevel,
      frequency: frequency as Frequency,
      timeWindows,
      locationRadius: locationRadius as LocationRadius,
      notes,
    },
  };
}

export type UserActivityPatch = Partial<Omit<UserActivityInput, "activityId">>;

export function validateUserActivityPatch(raw: unknown): ValidationResult<UserActivityPatch> {
  const errors: ValidationError[] = [];
  const body = (raw ?? {}) as Record<string, unknown>;
  const patch: UserActivityPatch = {};

  if (body.skillLevel !== undefined) {
    if (!isSkillLevel(body.skillLevel)) {
      errors.push(err("skillLevel", `must be one of: ${SKILL_LEVELS.join(", ")}`));
    } else {
      patch.skillLevel = body.skillLevel;
    }
  }

  if (body.frequency !== undefined) {
    if (!isFrequency(body.frequency)) {
      errors.push(err("frequency", `must be one of: ${FREQUENCIES.join(", ")}`));
    } else {
      patch.frequency = body.frequency;
    }
  }

  if (body.timeWindows !== undefined) {
    if (!Array.isArray(body.timeWindows) || body.timeWindows.length === 0) {
      errors.push(err("timeWindows", "pick at least one time window"));
    } else {
      const filtered = body.timeWindows.filter(isTimeWindow);
      if (filtered.length !== body.timeWindows.length) {
        errors.push(
          err("timeWindows", `unknown time window; valid: ${TIME_WINDOWS.join(", ")}`),
        );
      } else {
        patch.timeWindows = Array.from(new Set(filtered));
      }
    }
  }

  if (body.locationRadius !== undefined) {
    if (!isLocationRadius(body.locationRadius)) {
      errors.push(err("locationRadius", `must be one of: ${LOCATION_RADII.join(", ")}`));
    } else {
      patch.locationRadius = body.locationRadius;
    }
  }

  if (body.notes !== undefined) {
    if (body.notes === null) {
      patch.notes = null;
    } else if (typeof body.notes !== "string") {
      errors.push(err("notes", "must be a string"));
    } else {
      const trimmed = body.notes.trim();
      if (trimmed.length > NOTES_MAX) {
        errors.push(err("notes", `must be ${NOTES_MAX} characters or fewer`));
      } else {
        patch.notes = trimmed.length === 0 ? null : trimmed;
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };
  if (Object.keys(patch).length === 0) {
    return { ok: false, errors: [err("body", "no updatable fields provided")] };
  }
  return { ok: true, value: patch };
}

export type ActivityRequestInput = {
  slug: string;
  displayName: string;
  category: Category;
  justification: string;
};

export function validateActivityRequest(
  raw: unknown,
): ValidationResult<ActivityRequestInput> {
  const errors: ValidationError[] = [];
  const body = (raw ?? {}) as Record<string, unknown>;

  const slugRaw = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slugRaw) {
    errors.push(err("slug", "is required"));
  } else if (slugRaw.length > REQUEST_SLUG_MAX) {
    errors.push(err("slug", `must be ${REQUEST_SLUG_MAX} characters or fewer`));
  } else if (!/^[a-z][a-zA-Z0-9]*$/.test(slugRaw)) {
    errors.push(err("slug", "must be camelCase, starting with a lowercase letter"));
  }

  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  if (!displayName) {
    errors.push(err("displayName", "is required"));
  } else if (displayName.length > REQUEST_DISPLAY_NAME_MAX) {
    errors.push(
      err("displayName", `must be ${REQUEST_DISPLAY_NAME_MAX} characters or fewer`),
    );
  }

  const category = body.category;
  if (!isCategory(category)) {
    errors.push(err("category", `must be one of: ${CATEGORIES.join(", ")}`));
  }

  const justification = typeof body.justification === "string" ? body.justification.trim() : "";
  if (!justification) {
    errors.push(err("justification", "is required"));
  } else if (justification.length > REQUEST_JUSTIFICATION_MAX) {
    errors.push(
      err("justification", `must be ${REQUEST_JUSTIFICATION_MAX} characters or fewer`),
    );
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      slug: slugRaw,
      displayName,
      category: category as Category,
      justification,
    },
  };
}

export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
  );
}

export function isSkillLevel(value: unknown): value is SkillLevel {
  return typeof value === "string" && (SKILL_LEVELS as readonly string[]).includes(value);
}

export function isFrequency(value: unknown): value is Frequency {
  return typeof value === "string" && (FREQUENCIES as readonly string[]).includes(value);
}

export function isTimeWindow(value: unknown): value is TimeWindow {
  return typeof value === "string" && (TIME_WINDOWS as readonly string[]).includes(value);
}

export function isLocationRadius(value: unknown): value is LocationRadius {
  return typeof value === "string" && (LOCATION_RADII as readonly string[]).includes(value);
}

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && (CATEGORIES as readonly string[]).includes(value);
}
