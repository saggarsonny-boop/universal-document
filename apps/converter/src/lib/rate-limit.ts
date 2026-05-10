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
import { checkOperator } from './operator-auth'

const LIFETIME_FREE_LIMIT = 3
const DAILY_COOLDOWN_MS = 24 * 60 * 60 * 1000

export type RateLimitDecision =
  | {
      allow: true
      tier: 'free' | 'plus' | 'pro'
      ipHash?: string
      lifetimeUsed?: number
      /** Set when the request was authenticated as an operator. tier is
       *  reported as 'pro' for downstream gates; this field carries the
       *  identity for audit logging. */
      operator?: { identity: string; marker: 'clerk' | 'cookie' | 'header' }
    }
  | { allow: false; status: number;  body: unknown }

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
}

/** Check a request against the rate-limit rules. Order of precedence:
 * Operator (clerk/cookie/header) → Pro API key → Plus signed cookie →
 * free-tier lifetime/daily check. The first authenticated marker wins.
 * Operators are reported as tier='pro' for downstream gates but carry
 * the operator identity in the decision for audit logging. */
export async function checkRateLimit(req: NextRequest): Promise<RateLimitDecision> {
  // Operator — bypasses all gates (used for testing, debugging, emergency).
  // Logged separately to converter_operator_audit by the route handler.
  const op = checkOperator(req)
  if (op.isOperator && op.identity && op.marker) {
    return { allow: true, tier: 'pro', operator: { identity: op.identity, marker: op.marker } }
  }

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

  // Free tier is now UNLIMITED per executive order.
  // The Turnstile captcha will still be enforced on subsequent conversions in route.ts
  // but we no longer block based on lifetime count or daily cooldowns.


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
