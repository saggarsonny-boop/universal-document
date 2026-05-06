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
import { useStrings } from '@/lib/strings'

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
  const s = useStrings()
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
        <span style={{ color: 'var(--ud-muted)', fontSize: 13 }}>{s.tier.checking}</span>
      </div>
    )
  }

  if (usage.tier === 'pro') {
    return (
      <div style={{ ...containerStyle, background: 'rgba(10, 122, 106, 0.08)', borderColor: 'rgba(10, 122, 106, 0.25)' }} aria-live="polite">
        <strong style={{ color: 'var(--ud-teal, #0a7a6a)' }}>{s.tier.proLabel}</strong>
        <span style={{ color: 'var(--ud-muted)' }}>·</span>
        <span style={{ color: 'var(--ud-ink)' }}>{s.tier.proBody}</span>
      </div>
    )
  }

  if (usage.tier === 'plus') {
    return (
      <div style={{ ...containerStyle, background: 'rgba(212, 175, 55, 0.08)', borderColor: 'rgba(212, 175, 55, 0.25)' }} aria-live="polite">
        <strong style={{ color: GOLD }}>{s.tier.plusLabel}</strong>
        <span style={{ color: 'var(--ud-muted)' }}>·</span>
        <span style={{ color: 'var(--ud-ink)' }}>{s.tier.plusBody}</span>
      </div>
    )
  }

  // Free tier — show lifetime + daily status. Four cases, all driven from
  // the locale catalog so the wording localizes per navigator.language:
  //   - lifetimeExhausted     → "Free tier exhausted — upgrade to keep converting"
  //   - dailyExhausted        → "Next free conversion in ~24h · X of N lifetime remaining"
  //   - lifetimeUsed === 0    → "First free conversion available now · N lifetime free"
  //   - else                  → "X of N lifetime free conversions remaining"
  const lifetimeRemaining = Math.max(0, usage.lifetimeLimit - usage.lifetimeUsed)
  const dailyExhausted = usage.dailyUsed >= usage.dailyLimit && lifetimeRemaining > 0
  const lifetimeExhausted = lifetimeRemaining === 0

  let statusText: string
  if (lifetimeExhausted) {
    statusText = s.tier.lifetimeExhausted
  } else if (dailyExhausted) {
    statusText = s.tier.dailyCooldownTemplate
      .replace('{{remaining}}', String(lifetimeRemaining))
      .replace('{{limit}}', String(usage.lifetimeLimit))
  } else if (usage.lifetimeUsed === 0) {
    statusText = s.tier.freshTemplate.replace('{{limit}}', String(usage.lifetimeLimit))
  } else {
    statusText = s.tier.lifetimeRemainingTemplate
      .replace('{{remaining}}', String(lifetimeRemaining))
      .replace('{{limit}}', String(usage.lifetimeLimit))
  }

  return (
    <div style={containerStyle} aria-live="polite">
      <span style={{ color: 'var(--ud-ink)', fontWeight: 600 }}>{s.tier.freeLabel}</span>
      <span style={{ color: 'var(--ud-muted)' }}>·</span>
      <span style={{ color: 'var(--ud-muted)' }}>{statusText}</span>
      <UpgradeCta />
    </div>
  )
}

function UpgradeCta() {
  const s = useStrings()
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
      aria-label={s.tier.upgradeAria}
    >
      {s.tier.upgradeCta}
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
