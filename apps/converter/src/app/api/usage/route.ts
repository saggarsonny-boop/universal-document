// /api/usage — returns the current visitor's tier + free-tier usage.
//
// Used by the new UI's TierIndicator on mount to show "X of N free
// conversions today" + "Plus" / "Pro" subscriber labels. Cheap query,
// no rate-limit cost, no auth required for the free path; Pro users
// pass x-api-key.
//
// Free-tier counter today reads `converter_usage` (per-IP per-day). PR D
// extends the schema with `lifetime_count` + `most_recent_at` so this
// endpoint can swap to lifetime semantics without changing the client
// contract.

import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema, validateApiKey, hashIp, getFreeUsage } from '@/lib/db'

export const runtime = 'nodejs'
export const maxDuration = 10

const FREE_DAILY_LIMIT = 5  // matches the legacy /api/convert limit; PR D will lower to 1/day + 3 lifetime

function getIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
}

export async function GET(req: NextRequest) {
  try {
    let dbAvailable = true
    try { await ensureSchema() } catch (dbErr) {
      console.warn('DB unavailable for /api/usage:', dbErr)
      dbAvailable = false
    }

    // Pro-tier check first — x-api-key trumps IP-based free counting.
    const apiKey = req.headers.get('x-api-key')
    if (apiKey && dbAvailable) {
      const pro = await validateApiKey(apiKey).catch(() => null)
      if (pro) {
        return NextResponse.json({
          tier: 'pro',
          email: pro.email,
          freeUsedToday: 0,
          freeLimitToday: FREE_DAILY_LIMIT,
          unlimited: true,
        })
      }
    }

    // Plus-tier auth lands in PR D (signed cookie set on Stripe checkout
    // return). Until then, Plus users degrade to free-tier counting.
    if (!dbAvailable) {
      return NextResponse.json({
        tier: 'free',
        freeUsedToday: 0,
        freeLimitToday: FREE_DAILY_LIMIT,
        unlimited: false,
        dbAvailable: false,
      })
    }

    const ipHash = hashIp(getIp(req))
    const used = await getFreeUsage(ipHash).catch(() => 0)
    return NextResponse.json({
      tier: 'free',
      freeUsedToday: used,
      freeLimitToday: FREE_DAILY_LIMIT,
      unlimited: false,
    })
  } catch (e) {
    console.warn('/api/usage error:', e)
    return NextResponse.json(
      { tier: 'free', freeUsedToday: 0, freeLimitToday: FREE_DAILY_LIMIT, unlimited: false, error: e instanceof Error ? e.message : String(e) },
      { status: 200 },  // Fall through to a free-tier baseline rather than 500 — UI is non-critical.
    )
  }
}
