'use client'

// Visible tier indicator. Free / Plus / Pro labels + remaining-conversions
// counter. Upgrade CTA links to /pricing.
//
// Reads from /api/usage which (post-PR D) returns:
//   { tier, lifetimeUsed, lifetimeLimit, dailyUsed, dailyLimit, unlimited }
//
// All numeric fields default to 0 server-side AND are coalesced with
// `?? 0` here, so a missing/undefined field never leaks into the
// arithmetic and surfaces as "NaN of conversions remaining today" — the
// bug PR #9 fixed.

import { useEffect, useState } from 'react'

const GOLD = '#D4AF37'

export type UsageInfo = {
  tier: 'free' | 'plus' | 'pro'
  unlimited: boolean
  lifetimeUsed: number
  lifetimeLimit: number
  dailyUsed: number
  dailyLimit: number
}

type Props = {
  /** Reload key — bump after a successful conversion to refresh the count. */
  reloadNonce?: number
}

export function TierIndicator({ reloadNonce = 0 }: Props) {
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('converter_api_key') : null
    fetch('/api/usage', {
      headers: apiKey ? { 'X-API-Key': apiKey } : {},
    })
      .then(r => r.json())
      .then((data: Partial<UsageInfo> & { tier?: 'free' | 'plus' | 'pro' }) => {
        if (cancelled) return
        // Coalesce every numeric field defensively. The server already
        // defaults them to 0 but we guard the boundary so a malformed
        // response never produces NaN in the displayed string.
        setUsage({
          tier: data.tier ?? 'free',
          unlimited: data.unlimited ?? false,
          lifetimeUsed: Number.isFinite(data.lifetimeUsed) ? Number(data.lifetimeUsed) : 0,
          lifetimeLimit: Number.isFinite(data.lifetimeLimit) ? Number(data.lifetimeLimit) : 3,
          dailyUsed: Number.isFinite(data.dailyUsed) ? Number(data.dailyUsed) : 0,
          dailyLimit: Number.isFinite(data.dailyLimit) ? Number(data.dailyLimit) : 1,
        })
      })
      .catch(() => { /* fall through to placeholder */ })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [reloadNonce])

  if (loading || !usage) {
    return (
      <div style={containerStyle} aria-live="polite">
        <span style={{ color: 'var(--ud-muted)', fontSize: 13 }}>Checking your tier…</span>
      </div>
    )
  }

  if (usage.tier === 'pro') {
    return (
      <div style={{ ...containerStyle, background: 'rgba(10, 122, 106, 0.08)', borderColor: 'rgba(10, 122, 106, 0.25)' }} aria-live="polite">
        <strong style={{ color: 'var(--ud-teal, #0a7a6a)' }}>Pro</strong>
        <span style={{ color: 'var(--ud-muted)' }}>·</span>
        <span style={{ color: 'var(--ud-ink)' }}>unlimited conversions + batch + API</span>
      </div>
    )
  }

  if (usage.tier === 'plus') {
    return (
      <div style={{ ...containerStyle, background: 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.25)' }} aria-live="polite">
        <strong style={{ color: GOLD }}>Plus</strong>
        <span style={{ color: 'var(--ud-muted)' }}>·</span>
        <span style={{ color: 'var(--ud-ink)' }}>unlimited single-file conversions</span>
      </div>
    )
  }

  // Free tier — show lifetime + daily status.
  // Display rules:
  //   - First conversion never used  → "First conversion available now"
  //   - At least one used, no daily cooldown  → "X of N lifetime free remaining"
  //   - Daily cooldown active (1 used today)  → "Next free conversion in ~Hh"
  //   - Lifetime cap reached  → "Free tier exhausted — upgrade for more"
  const lifetimeRemaining = Math.max(0, usage.lifetimeLimit - usage.lifetimeUsed)
  const dailyExhausted = usage.dailyUsed >= usage.dailyLimit && lifetimeRemaining > 0
  const lifetimeExhausted = lifetimeRemaining === 0

  let statusText: string
  if (lifetimeExhausted) {
    statusText = 'Free tier exhausted — upgrade to keep converting'
  } else if (dailyExhausted) {
    statusText = `Next free conversion in ~24h · ${lifetimeRemaining} of ${usage.lifetimeLimit} lifetime remaining`
  } else if (usage.lifetimeUsed === 0) {
    statusText = `First free conversion available now · ${usage.lifetimeLimit} lifetime free`
  } else {
    statusText = `${lifetimeRemaining} of ${usage.lifetimeLimit} lifetime free conversions remaining`
  }

  return (
    <div style={containerStyle} aria-live="polite">
      <span style={{ color: 'var(--ud-ink)', fontWeight: 600 }}>Free tier</span>
      <span style={{ color: 'var(--ud-muted)' }}>·</span>
      <span style={{ color: 'var(--ud-muted)' }}>{statusText}</span>
      <UpgradeCta />
    </div>
  )
}

function UpgradeCta() {
  return (
    <a
      href="/pricing"
      style={{
        marginLeft: 'auto',
        background: GOLD,
        color: '#1e2d3d',
        border: 'none',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 700,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
      aria-label="View pricing — Free, Plus, and Pro tiers"
    >
      See pricing
    </a>
  )
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 8,
  padding: '8px 14px',
  border: '1px solid var(--ud-border)',
  borderRadius: 8,
  background: 'var(--ud-paper-2, #f2f1ee)',
  fontSize: 13,
}
