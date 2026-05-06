// PR D — rate-limit enforcement helper for the converter route handlers.
//
// Free-tier rule (Sonny's amendment):
//   Block if lifetime_count >= 3
//   OR last_conversion_at within last 24 hours
//
// Plus + Pro tiers skip both checks.
//
// Returns either { allow: true, tier } (caller proceeds) or { allow: false,
// status, body } (caller returns the JSON directly).

import type { NextRequest } from 'next/server'
import { getFreeTierState, validateApiKey, hashIp, recordFreeConversion } from './db'
import { readPlusFromRequest } from './plus-auth'

const LIFETIME_FREE_LIMIT = 3
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000

export type RateLimitDecision =
  | { allow: true;  tier: 'free' | 'plus' | 'pro';  ipHash?: string;  lifetimeUsed?: number }
  | { allow: false; status: number;  body: unknown }

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

/** Check a request against the rate-limit rules. Order of precedence:
 * Pro API key → Plus signed cookie → free-tier lifetime/daily check. The
 * first authenticated tier wins. */
export async function checkRateLimit(req: NextRequest): Promise<RateLimitDecision> {
  // Pro tier — x-api-key header
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const pro = await validateApiKey(apiKey).catch(() => null)
    if (pro) return { allow: true, tier: 'pro' }
    // Invalid key — fall through to free-tier counting (don't 403; the
    // user might have stale localStorage from a deleted account).
  }

  // Plus tier — `ud_plus` signed cookie
  const plus = await readPlusFromRequest(req).catch(() => null)
  if (plus) return { allow: true, tier: 'plus' }

  // Free tier — check lifetime + daily caps
  const ipHash = hashIp(getIp(req))
  const state = await getFreeTierState(ipHash).catch(() => ({ lifetimeCount: 0, lastConversionAt: null as Date | null }))

  if (state.lifetimeCount >= LIFETIME_FREE_LIMIT) {
    return {
      allow: false,
      status: 429,
      body: {
        error: 'free_limit_reached',
        message: `You've used your ${LIFETIME_FREE_LIMIT} free conversions. Upgrade to UD Converter Plus for $0.97/month for unlimited conversions, or to Pro for $29/month for batch + API + chain of custody.`,
        recoverable: false,
        upgrade: true,
        upgrade_url: '/pricing',
        lifetime_used: state.lifetimeCount,
        lifetime_limit: LIFETIME_FREE_LIMIT,
        daily_used: 0,
        daily_limit: 1,
      },
    }
  }

  if (state.lastConversionAt && Date.now() - state.lastConversionAt.getTime() < DAILY_COOLDOWN_MS) {
    const hoursLeft = Math.max(1, Math.ceil((DAILY_COOLDOWN_MS - (Date.now() - state.lastConversionAt.getTime())) / (60 * 60 * 1000)))
    return {
      allow: false,
      status: 429,
      body: {
        error: 'daily_limit_reached',
        message: `Free tier: 1 conversion per 24 hours. Try again in about ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}, or upgrade to Plus for $0.97/month for unlimited conversions.`,
        recoverable: false,
        upgrade: true,
        upgrade_url: '/pricing',
        lifetime_used: state.lifetimeCount,
        lifetime_limit: LIFETIME_FREE_LIMIT,
        daily_used: 1,
        daily_limit: 1,
        retry_after_hours: hoursLeft,
      },
    }
  }

  return { allow: true, tier: 'free', ipHash, lifetimeUsed: state.lifetimeCount }
}

/** Record a successful free-tier conversion (increments lifetime + sets
 * last_at). Caller passes the ipHash returned from `checkRateLimit`. */
export async function recordFreeConversionFromCheck(ipHash: string): Promise<void> {
  await recordFreeConversion(ipHash).catch((err) => {
    console.warn('recordFreeConversion failed (non-fatal):', err)
  })
}

export { LIFETIME_FREE_LIMIT }
