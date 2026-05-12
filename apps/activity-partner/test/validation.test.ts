// Pure-function unit tests for lib/validation/activity.ts. Run via:
//   npm test            (uses node --test + tsx loader)
//
// Covers the happy path and the error cases the API routes depend on.
// Route-level integration tests live elsewhere (require Neon + Clerk).

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  validateUserActivity,
  validateUserActivityPatch,
  validateActivityRequest,
  isUuid,
  isSkillLevel,
  isFrequency,
  isTimeWindow,
  isLocationRadius,
  isCategory,
  NOTES_MAX,
  REQUEST_DISPLAY_NAME_MAX,
  REQUEST_JUSTIFICATION_MAX,
  REQUEST_SLUG_MAX,
} from "../lib/validation/activity";

const VALID_UUID = "11111111-2222-3333-4444-555555555555";

test("isUuid accepts canonical UUID and rejects garbage", () => {
  assert.equal(isUuid(VALID_UUID), true);
  assert.equal(isUuid("not-a-uuid"), false);
  assert.equal(isUuid(""), false);
  assert.equal(isUuid(123), false);
});

test("isSkillLevel/isFrequency/isTimeWindow/isLocationRadius/isCategory enforce enums", () => {
  assert.equal(isSkillLevel("beginner"), true);
  assert.equal(isSkillLevel("expert"), false);

  assert.equal(isFrequency("weekly"), true);
  assert.equal(isFrequency("yearly"), false);

  assert.equal(isTimeWindow("weekday_morning"), true);
  assert.equal(isTimeWindow("noon"), false);

  assert.equal(isLocationRadius("walk"), true);
  assert.equal(isLocationRadius("teleport"), false);

  assert.equal(isCategory("sport"), true);
  assert.equal(isCategory("ego"), false);
});

test("validateUserActivity — happy path", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "intermediate",
    frequency: "weekly",
    timeWindows: ["weekday_evening", "weekend_morning"],
    locationRadius: "transit",
    notes: "Looking for a hitting partner.",
  });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(r.value.timeWindows, ["weekday_evening", "weekend_morning"]);
  assert.equal(r.value.notes, "Looking for a hitting partner.");
});

test("validateUserActivity — empty notes coerced to null", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "any",
    frequency: "flexible",
    timeWindows: ["weekday_morning"],
    locationRadius: "walk",
    notes: "   ",
  });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.notes, null);
});

test("validateUserActivity — rejects bad activityId", () => {
  const r = validateUserActivity({
    activityId: "nope",
    skillLevel: "beginner",
    frequency: "weekly",
    timeWindows: ["weekday_evening"],
    locationRadius: "walk",
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.ok(r.errors.some((e) => e.field === "activityId"));
});

test("validateUserActivity — rejects empty timeWindows", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "beginner",
    frequency: "weekly",
    timeWindows: [],
    locationRadius: "walk",
  });
  assert.equal(r.ok, false);
});

test("validateUserActivity — rejects unknown timeWindow value", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "beginner",
    frequency: "weekly",
    timeWindows: ["noon"],
    locationRadius: "walk",
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.ok(r.errors.some((e) => e.field === "timeWindows"));
});

test("validateUserActivity — rejects bad enums", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "guru",
    frequency: "yearly",
    timeWindows: ["weekday_morning"],
    locationRadius: "teleport",
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  const fields = new Set(r.errors.map((e) => e.field));
  assert.ok(fields.has("skillLevel"));
  assert.ok(fields.has("frequency"));
  assert.ok(fields.has("locationRadius"));
});

test("validateUserActivity — rejects oversize notes", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "beginner",
    frequency: "weekly",
    timeWindows: ["weekday_evening"],
    locationRadius: "walk",
    notes: "x".repeat(NOTES_MAX + 1),
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.ok(r.errors.some((e) => e.field === "notes"));
});

test("validateUserActivity — dedupes timeWindows", () => {
  const r = validateUserActivity({
    activityId: VALID_UUID,
    skillLevel: "beginner",
    frequency: "weekly",
    timeWindows: ["weekday_evening", "weekday_evening"],
    locationRadius: "walk",
  });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.deepEqual(r.value.timeWindows, ["weekday_evening"]);
});

test("validateUserActivityPatch — empty body rejected", () => {
  const r = validateUserActivityPatch({});
  assert.equal(r.ok, false);
});

test("validateUserActivityPatch — single field accepted", () => {
  const r = validateUserActivityPatch({ skillLevel: "advanced" });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.skillLevel, "advanced");
});

test("validateUserActivityPatch — null notes clears the field", () => {
  const r = validateUserActivityPatch({ notes: null });
  assert.equal(r.ok, true);
  if (!r.ok) return;
  assert.equal(r.value.notes, null);
});

test("validateActivityRequest — happy path", () => {
  const r = validateActivityRequest({
    slug: "frisbeeGolf",
    displayName: "Frisbee Golf",
    category: "outdoor",
    justification: "Public-park sport, low equipment, easy to find a partner.",
  });
  assert.equal(r.ok, true);
});

test("validateActivityRequest — slug must be camelCase", () => {
  const r = validateActivityRequest({
    slug: "frisbee-golf",
    displayName: "Frisbee Golf",
    category: "outdoor",
    justification: "ok",
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.ok(r.errors.some((e) => e.field === "slug"));
});

test("validateActivityRequest — rejects oversize fields", () => {
  const r = validateActivityRequest({
    slug: "x".repeat(REQUEST_SLUG_MAX + 1),
    displayName: "x".repeat(REQUEST_DISPLAY_NAME_MAX + 1),
    category: "outdoor",
    justification: "x".repeat(REQUEST_JUSTIFICATION_MAX + 1),
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  const fields = new Set(r.errors.map((e) => e.field));
  assert.ok(fields.has("slug"));
  assert.ok(fields.has("displayName"));
  assert.ok(fields.has("justification"));
});

test("validateActivityRequest — rejects unknown category", () => {
  const r = validateActivityRequest({
    slug: "ok",
    displayName: "ok",
    category: "magic",
    justification: "x",
  });
  assert.equal(r.ok, false);
  if (r.ok) return;
  assert.ok(r.errors.some((e) => e.field === "category"));
});
