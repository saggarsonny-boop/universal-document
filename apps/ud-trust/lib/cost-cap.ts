// Lightweight in-process cost cap. HiveConfessionEngine is stateless (no DB), so
// we can't keep a persistent ledger like hive-confession does. Instead we count
// per-process spend in module-scoped variables that reset on every cold
// start. This is a soft brake, not a hard one — if the engine is hot for
// a long stretch, the per-process counter rises until the instance
// recycles.
//
// The HARD cap on cost lives at the Vercel function timeout level (10s
// default for hobby tier) plus the per-provider spend caps configured in
// the Anthropic / OpenAI dashboards. This module exists so the explain
// route has a fast in-memory check that fires before the SDK call rather
// than after.
//
// Two budgets, tracked separately:
//   - Text/Anthropic spend (existing behaviour). DAILY_CAP_CENTS default
//     500 ($5/day). Tunable via PLAINSCAN_DAILY_CAP_CENTS.
//   - Image-generation spend (gpt-image-1 high ≈ $0.25/image). IMAGE_
//     DAILY_CAP_CENTS default 1000 ($10/day ≈ 40 high-quality images).
//     Tunable via PLAINSCAN_IMAGE_DAILY_CAP_CENTS.
//
// Per-session image cap: most reports don't need more than 1 illustration
// (the single primary finding). We cap at 3/session to allow re-rolls
// when the operator regenerates after editing the report. Sessions are
// keyed on a `sessionId` opaque string the client passes; the explain
// route extracts it and passes it here. No `sessionId` → counts against a
// shared "anonymous" bucket (also capped). Session counters reset on
// cold start; if you need durable per-session caps, swap this for a Neon
// row-counter (out of scope for this PR).

const DAILY_CAP_CENTS = Number(process.env.PLAINSCAN_DAILY_CAP_CENTS ?? 500);
const IMAGE_DAILY_CAP_CENTS = Number(
  process.env.PLAINSCAN_IMAGE_DAILY_CAP_CENTS ?? 1000,
);
const PER_SESSION_IMAGE_CAP = Number(
  process.env.PLAINSCAN_PER_SESSION_IMAGE_CAP ?? 3,
);

let spentToday = 0;
let imageSpentToday = 0;
let resetAt = midnightUtc();
const imageCountBySession = new Map<string, number>();

function midnightUtc(): number {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime();
}

function maybeReset(): void {
  if (Date.now() >= resetAt) {
    spentToday = 0;
    imageSpentToday = 0;
    imageCountBySession.clear();
    resetAt = midnightUtc();
  }
}

// ─── Text / Anthropic budget ───────────────────────────────────────────

export function isOverCap(): boolean {
  maybeReset();
  return spentToday >= DAILY_CAP_CENTS;
}

export function recordSpend(cents: number): void {
  if (cents <= 0) return;
  maybeReset();
  spentToday += cents;
}

/** Anthropic Sonnet 4 pricing as of 2026-05: input $3/M, output $15/M. */
export function estimateAnthropicCents(
  promptTokens: number,
  completionTokens: number,
): number {
  const inputCents = (promptTokens / 1_000_000) * 300;
  const outputCents = (completionTokens / 1_000_000) * 1500;
  return Math.max(1, Math.ceil(inputCents + outputCents));
}

// ─── Image-generation budget ───────────────────────────────────────────

/** True iff image generation should be skipped for this caller, either
 *  because the daily fleet image cap is reached or this caller's session
 *  has already hit PER_SESSION_IMAGE_CAP. Caller falls back to the SVG
 *  diagram when this returns true. */
export function isImageOverCap(sessionId?: string | null): boolean {
  maybeReset();
  if (imageSpentToday >= IMAGE_DAILY_CAP_CENTS) return true;
  const key = sessionId && sessionId.length > 0 ? sessionId : "__anon__";
  const count = imageCountBySession.get(key) ?? 0;
  return count >= PER_SESSION_IMAGE_CAP;
}

/** Record one successful image-generation call. Increments both the
 *  per-day cents counter and the per-session count. Caller passes the
 *  cents the provider actually charged (gpt-image-1 high ≈ 25, medium
 *  ≈ 5; FLUX schnell passes 0 since it's free-tier on Replicate). */
export function recordImageSpend(
  cents: number,
  sessionId?: string | null,
): void {
  maybeReset();
  if (cents > 0) imageSpentToday += cents;
  const key = sessionId && sessionId.length > 0 ? sessionId : "__anon__";
  imageCountBySession.set(key, (imageCountBySession.get(key) ?? 0) + 1);
}

/** For observability — exposed in /api/health when we want to surface
 *  current spend pressure. Cents resolution. */
export function imageBudgetSnapshot(): {
  imageDailyCapCents: number;
  imageSpentTodayCents: number;
  perSessionImageCap: number;
} {
  maybeReset();
  return {
    imageDailyCapCents: IMAGE_DAILY_CAP_CENTS,
    imageSpentTodayCents: imageSpentToday,
    perSessionImageCap: PER_SESSION_IMAGE_CAP,
  };
}
