'use client'

// Visible tier indicator. Free / Plus / Pro labels + remaining-conversions
// counter. Upgrade CTA links to /pricing.
//
// Reads /api/usage on mount and after every successful conversion. The
// fields below match the route handler's response shape verbatim — earlier
// versions of this component used `freeUsedToday` / `freeLimitToday` which
// the API never returned, producing `NaN` in the "X of N remaining today"
// display. All numeric fields are defaulted to 0 with `??` so a partial
// or empty response can never re-introduce that NaN.

import { useEffect, useState } from 'react'
import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'

// Mirrors apps/converter/src/app/api/usage/route.ts response shape.
export type UsageInfo = {
  tier: 'free' | 'plus' | 'pro'
  unlimited: boolean
  lifetimeUsed?: number
  lifetimeLimit?: number
  dailyUsed?: number
  dailyLimit?: number
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
      .then((data: UsageInfo) => { if (!cancelled) setUsage(data) })
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

  // Free tier — show remaining count + Upgrade CTA. Defensive `?? 0`
  // defaults: the route handler always returns these fields but on the
  // network-error / dbAvailable=false paths the response can omit any of
  // them. Treating undefined/null as 0 keeps the math integer-clean.
  const dailyUsed = usage.dailyUsed ?? 0
  const dailyLimit = usage.dailyLimit ?? 1
  const lifetimeUsed = usage.lifetimeUsed ?? 0
  const remaining = Math.max(0, dailyLimit - dailyUsed)

  // Fresh-user copy when nothing has been converted yet on this device:
  // "first conversion available now" reads more welcoming than
  // "1 of 1 conversions remaining today" for someone who has never
  // touched the engine.
  const isFresh = lifetimeUsed === 0 && dailyUsed === 0

  // Fresh user: render the freshFirstConversion sentence as a single span
  // (it already contains the "Free tier — ..." prefix in the locale catalog,
  // so no separate label / "·" separator). Returning user: render the
  // standard "Free tier · X of N remaining today" layout.
  return (
    <div style={containerStyle} aria-live="polite">
      {isFresh ? (
        <span style={{ color: 'var(--ud-ink)' }}>{s.tier.freshFirstConversion}</span>
      ) : (
        <>
          <span style={{ color: 'var(--ud-ink)', fontWeight: 600 }}>{s.tier.freeLabel}</span>
          <span style={{ color: 'var(--ud-muted)' }}>·</span>
          <span style={{ color: 'var(--ud-muted)' }}>
            {s.tier.freeRemainingTemplate
              .replace('{{remaining}}', String(remaining))
              .replace('{{limit}}', String(dailyLimit))}
          </span>
        </>
      )}
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
