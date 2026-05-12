// Typed fetchers for the Phase 2 activity routes. All call the same-origin
// API; auth comes from the Clerk session cookie. Defense-in-depth: assertNoLocation
// strips exact_location_lat/lng client-side too — the API already strips them,
// but a leaked field would render in the UI without this second pass.

import type {
  SkillLevel,
  Frequency,
  TimeWindow,
  LocationRadius,
  Category,
  ValidationError,
} from "@/lib/validation/activity";

export type TaxonomyActivity = {
  id: string;
  slug: string;
  displayName: string;
  category: Category;
};

export type UserActivity = {
  id: string;
  activityId: string;
  slug: string;
  displayName: string;
  category: Category;
  skillLevel: SkillLevel;
  frequency: Frequency;
  timeWindows: TimeWindow[];
  locationRadius: LocationRadius;
  notes: string | null;
  createdAt: string;
};

export type AddActivityInput = {
  activityId: string;
  skillLevel: SkillLevel;
  frequency: Frequency;
  timeWindows: TimeWindow[];
  locationRadius: LocationRadius;
  notes: string | null;
};

export type RequestActivityInput = {
  slug: string;
  displayName: string;
  category: Category;
  justification: string;
};

export type ApiError = {
  status: number;
  code: string;
  errors?: ValidationError[];
  message?: string;
};

const FORBIDDEN_KEYS = new Set(["exact_location_lat", "exact_location_lng"]);

function assertNoLocation<T>(value: T): T {
  if (value && typeof value === "object") {
    if (Array.isArray(value)) {
      value.forEach(assertNoLocation);
    } else {
      for (const key of Object.keys(value as Record<string, unknown>)) {
        if (FORBIDDEN_KEYS.has(key)) {
          // Strip silently rather than throw — the API already strips, this is
          // last-line defense. Logging would leak the error path to the client.
          delete (value as Record<string, unknown>)[key];
        } else {
          assertNoLocation((value as Record<string, unknown>)[key]);
        }
      }
    }
  }
  return value;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: { error?: string; errors?: ValidationError[]; message?: string } = {};
  try {
    body = (await res.json()) as typeof body;
  } catch {
    // Fall through to default message.
  }
  return {
    status: res.status,
    code: body.error ?? `HTTP_${res.status}`,
    errors: body.errors,
    message: body.message,
  };
}

export async function listTaxonomy(category?: Category): Promise<TaxonomyActivity[]> {
  const url = category
    ? `/api/activities/list?category=${encodeURIComponent(category)}`
    : "/api/activities/list";
  const res = await fetch(url, { credentials: "same-origin" });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as { activities: TaxonomyActivity[] };
  return assertNoLocation(data.activities);
}

export async function listMyActivities(): Promise<UserActivity[]> {
  const res = await fetch("/api/users/me/activities", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) throw await parseError(res);
  const data = (await res.json()) as { activities: UserActivity[] };
  return assertNoLocation(data.activities);
}

export async function addMyActivity(input: AddActivityInput): Promise<{ id: string }> {
  const res = await fetch("/api/users/me/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as { id: string };
}

export async function patchMyActivity(
  id: string,
  patch: Partial<Omit<AddActivityInput, "activityId">>,
): Promise<{ id: string }> {
  const res = await fetch(`/api/users/me/activities/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
    credentials: "same-origin",
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as { id: string };
}

export async function deactivateMyActivity(id: string): Promise<{ id: string }> {
  const res = await fetch(`/api/users/me/activities/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as { id: string };
}

export async function requestNewActivity(
  input: RequestActivityInput,
): Promise<{ id: string; status: string }> {
  const res = await fetch("/api/activities/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    credentials: "same-origin",
  });
  if (!res.ok) throw await parseError(res);
  return (await res.json()) as { id: string; status: string };
}

export function isApiError(value: unknown): value is ApiError {
  return Boolean(
    value &&
      typeof value === "object" &&
      "status" in value &&
      "code" in value,
  );
}
