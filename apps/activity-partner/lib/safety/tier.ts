// Tier resolver for HAP rate limits.
//
// HAP doesn't yet have a tier column on hap_users — Stripe subscription state
// will land in a later phase. Until then this resolver returns 'free' for
// everyone. This is the single chokepoint: when Stripe wiring lands, only
// this function changes.
//
// Returning a single string here (not a promise of richer subscription state)
// is deliberate — keeps the rate-limit call sites simple and avoids guessing
// at the eventual tier-source schema.

export const TIERS = ["free", "plus", "pro"] as const;
export type Tier = (typeof TIERS)[number];

export function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
}

// Resolve the tier for a hap_users.id. Currently always 'free'; replace the
// body when Stripe state is wired into hap_users (or a join table).
export async function getUserTier(_userId: string): Promise<Tier> {
  return "free";
}
