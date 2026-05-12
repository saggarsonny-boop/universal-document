// /api/usage — returns the current visitor's tier + free-tier usage.
//
// Used by the new UI's TierIndicator on mount to render "X of N free
// conversions remaining". Cheap query, no rate-limit cost.
//
// Tier resolution order matches the rate-limit logic:
//   1. Pro API key (x-api-key header) → tier=pro
//   2. Plus signed cookie (ud_plus)    → tier=plus
//   3. Otherwise                        → tier=free with lifetime + daily counters

import { NextRequest, NextResponse } from 'next/server'
import { ensureSchema, validateApiKey, hashIp, getFreeTierState } from '@/lib/db'
import { readPlusFromRequest } from '@/lib/plus-auth'
import { LIFETIME_FREE_LIMIT } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 10
export const dynamic = 'force-dynamic'

const DAILY_LIMIT = 1  // Free tier: 1 conversion per 24 hours

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

    // Pro tier — x-api-key trumps everything.
    const apiKey = req.headers.get('x-api-key')
    if (apiKey && dbAvailable) {
      const pro = await validateApiKey(apiKey).catch(() => null)
      if (pro) {
        return NextResponse.json({
          tier: 'pro',
          email: pro.email,
          unlimited: true,
          lifetimeUsed: 0,
          lifetimeLimit: LIFETIME_FREE_LIMIT,
          dailyUsed: 0,
          dailyLimit: DAILY_LIMIT,
        })
      }
    }

    // Plus tier — `ud_plus` signed cookie.
    const plus = await readPlusFromRequest(req).catch(() => null)
    if (plus) {
      return NextResponse.json({
        tier: 'plus',
        email: plus.email,
        unlimited: true,
        lifetimeUsed: 0,
        lifetimeLimit: LIFETIME_FREE_LIMIT,
        dailyUsed: 0,
        dailyLimit: DAILY_LIMIT,
      })
    }

    // Free tier — read lifetime + last-conversion state.
    if (!dbAvailable) {
      return NextResponse.json({
        tier: 'free',
        unlimited: false,
        lifetimeUsed: 0,
        lifetimeLimit: LIFETIME_FREE_LIMIT,
        dailyUsed: 0,
        dailyLimit: DAILY_LIMIT,
        dbAvailable: false,
      })
    }

    const ipHash = hashIp(getIp(req))
    const state = await getFreeTierState(ipHash).catch(() => ({ lifetimeCount: 0, lastConversionAt: null as Date | null }))
    const dailyUsed = state.lastConversionAt && Date.now() - state.lastConversionAt.getTime() < 24 * 60 * 60 * 1000 ? 1 : 0
    return NextResponse.json({
      tier: 'free',
      unlimited: false,
      lifetimeUsed: state.lifetimeCount,
      lifetimeLimit: LIFETIME_FREE_LIMIT,
      dailyUsed,
      dailyLimit: DAILY_LIMIT,
    })
  } catch (e) {
    console.warn('/api/usage error:', e)
    return NextResponse.json(
      {
        tier: 'free',
        unlimited: false,
        lifetimeUsed: 0,
        lifetimeLimit: LIFETIME_FREE_LIMIT,
        dailyUsed: 0,
        dailyLimit: DAILY_LIMIT,
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 200 },  // Non-critical UI data — fall through to free baseline rather than 500
    )
  }
}
