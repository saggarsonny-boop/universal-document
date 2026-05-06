'use client'

// Visible tier indicator. Free / Plus / Pro labels + remaining-conversions
// counter. Upgrade CTA links to a placeholder route until PR D ships
// Stripe checkout for the Plus tier.
//
// Today the "remaining" count reads from /api/usage (per-day, server-
// computed). PR D extends the schema with lifetime_count + most_recent_at;
// this component's contract stays the same — only the wording shifts
// from "today" to "lifetime".

import { useEffect, useState } from 'react'

const GOLD = '#D4AF37'

export type UsageInfo = {
  tier: 'free' | 'plus' | 'pro'
  freeUsedToday: number
  freeLimitToday: number
  unlimited: boolean
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
      .then((data: UsageInfo) => { if (!cancelled) setUsage(data) })
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

  // Free tier — show remaining count + Upgrade CTA
  const remaining = Math.max(0, usage.freeLimitToday - usage.freeUsedToday)
  return (
    <div style={containerStyle} aria-live="polite">
      <span style={{ color: 'var(--ud-ink)', fontWeight: 600 }}>Free tier</span>
      <span style={{ color: 'var(--ud-muted)' }}>·</span>
      <span style={{ color: 'var(--ud-muted)' }}>
        {remaining} of {usage.freeLimitToday} conversions remaining today
      </span>
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
      aria-label="View pricing — upgrade to UD Converter Plus or Pro"
    >
      Upgrade — from $0.97/mo
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
