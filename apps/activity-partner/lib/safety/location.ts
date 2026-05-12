// Location obfuscation enforcement — defense-in-depth on top of the existing
// stripForbidden() helper in lib/profile.ts and the SELECTs in lib/auth.ts
// that already omit exact_location_*. Three layers exist on purpose: a
// regression at any single layer should still leave the others standing.
//
// What this module adds:
//
// 1) `assertNoExactLocation(payload)` — throws + emits a tier-1 hive_alert
//    if a response payload anywhere in HAP includes either of the forbidden
//    coordinate fields. Wrap NextResponse.json bodies that touch user data.
//
// 2) `validateRadiusChoice(radius)` — rejects radius values that aren't from
//    the canonical bucket set. Free-text radii would let a hostile client
//    encode a precise distance and re-derive coordinates over multiple
//    submissions. Buckets are the only shape that ships.
//
// 3) `recordLocationLeakIfPresent(payload, route)` — fire-and-forget telemetry.
//    Always best-effort; never throws into the response path. Distinct from
//    the assertion: telemetry runs even when the assertion is wrapped in a
//    throw-suppressing path.

import { LOCATION_RADII, type LocationRadius, isLocationRadius } from "../validation/activity";
import { emitTier1Alert } from "./alerts";

export const FORBIDDEN_LOCATION_FIELDS = [
  "exact_location_lat",
  "exact_location_lng",
  "exactLocationLat",
  "exactLocationLng",
] as const;

type ForbiddenField = (typeof FORBIDDEN_LOCATION_FIELDS)[number];

function findLeakedFields(value: unknown, depth = 0): ForbiddenField[] {
  if (depth > 4 || value === null || typeof value !== "object") return [];
  const found: ForbiddenField[] = [];
  if (Array.isArray(value)) {
    for (const item of value) found.push(...findLeakedFields(item, depth + 1));
    return found;
  }
  const obj = value as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if ((FORBIDDEN_LOCATION_FIELDS as readonly string[]).includes(key)) {
      found.push(key as ForbiddenField);
    }
    found.push(...findLeakedFields(obj[key], depth + 1));
  }
  return found;
}

// Throws if the payload would leak exact-location fields. Only use on response
// shapes destined for the wire — internal SQL row objects routinely have
// these fields and that's fine.
export function assertNoExactLocation(payload: unknown, route: string): void {
  const leaks = findLeakedFields(payload);
  if (leaks.length === 0) return;
  // Best-effort tier-1 alert — fire-and-forget so the assertion remains
  // synchronous from the caller's perspective.
  void emitTier1Alert({
    subject: `HAP location leak in ${route}`,
    body:
      `Response payload from ${route} included forbidden field(s): ${leaks.join(", ")}. ` +
      `Refusing to ship the response.`,
    actionRequired: true,
  });
  throw new Error(`LOCATION_LEAK:${leaks.join(",")}`);
}

// Telemetry-only variant. Same scan, same alert, but never throws. Use when
// the response has already been built and you want a paranoia check.
export function recordLocationLeakIfPresent(payload: unknown, route: string): void {
  const leaks = findLeakedFields(payload);
  if (leaks.length === 0) return;
  void emitTier1Alert({
    subject: `HAP location leak in ${route}`,
    body:
      `Telemetry detected forbidden field(s) ${leaks.join(", ")} on outbound payload from ${route}. ` +
      `Investigate immediately — this should never happen.`,
    actionRequired: true,
  });
}

// Validate a client-submitted radius. The full enforcement loop is:
//   - reject anything that isn't a canonical bucket name (here)
//   - never let the client pass numeric metres / km (no field exists)
//   - matching layer joins on bucket names, not coordinates
// Any of the above by itself would close the leak; together they make
// inference attacks via radius churn ineffective.
export function validateRadiusChoice(value: unknown):
  | { ok: true; value: LocationRadius }
  | { ok: false; message: string } {
  if (!isLocationRadius(value)) {
    return {
      ok: false,
      message: `radius must be one of: ${LOCATION_RADII.join(", ")}`,
    };
  }
  return { ok: true, value };
}
