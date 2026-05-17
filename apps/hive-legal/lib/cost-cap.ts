// Lightweight in-process cost cap. HivePlainscan is stateless (no DB), so
// we can't keep a persistent ledger like secret-box does. Instead we count
// per-process Anthropic spend in a module-scoped variable that resets on
// every cold start. This is a soft brake, not a hard one — if the engine
// is hot for a long stretch, the per-process counter rises until the
// instance recycles.
//
// The HARD cap on cost lives at the Vercel function timeout level (10s
// default for hobby tier) plus the Anthropic per-key spend cap configured
// in the dashboard. This module exists so the explain route has a fast
// in-memory check that fires before the SDK call rather than after.

const DAILY_CAP_CENTS = Number(process.env.PLAINSCAN_DAILY_CAP_CENTS ?? 500);

let spentToday = 0;
let resetAt = midnightUtc();

function midnightUtc(): number {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime();
}

function maybeReset(): void {
  if (Date.now() >= resetAt) {
    spentToday = 0;
    resetAt = midnightUtc();
  }
}

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
