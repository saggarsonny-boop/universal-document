'use client'

// PR D — pricing page rewritten for the three-tier UD Converter v2
// pricing model:
//   Free:  3 lifetime conversions, 1 per 24h, captcha after 1st, 10MB / 25 pages
//   Plus:  $0.97/mo unlimited single-file conversions, 25 MB / 100 pages
//   Pro:   $29/mo unlimited everything + batch + API + 50 MB + chain of custody
//
// Subscribe CTAs POST to /api/checkout with the appropriate plan key:
//   Plus → { plan: 'plus_monthly' } → success_url=/?plus_session_id=…
//   Pro  → { plan: 'monthly' }      → success_url=/pro?session_id=…
// (existing Pro yearly $249 plan is still selectable from the Pro card.)

import { useState } from 'react'
import type { PlanKey } from '@/lib/stripe'

const GOLD = '#D4AF37'
const INK = 'var(--ud-ink, #1e2d3d)'

export default function PricingPage() {
  const [loading, setLoading] = useState<PlanKey | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function startCheckout(plan: PlanKey) {
    setLoading(plan)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Failed to start checkout. Please try again.')
        setLoading(null)
        return
      }
      window.location.href = data.url
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error.')
      setLoading(null)
    }
  }

  return (
    <main style={{ maxWidth: 1080, margin: '0 auto', padding: '64px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: INK, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Pricing
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ud-muted)', maxWidth: 540, margin: '0 auto', lineHeight: 1.5 }}>
          Free for casual use. Plus for $0.97/month if you want it more often. Pro for batch + API + chain of custody.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1080, margin: '0 auto 56px' }}>
        {/* ———————————————————————————————————————————————————————— */}
        <TierCard
          tier="Free"
          price="$0"
          subtitle="Unlimited. No card required."
          features={[
            'Unlimited conversions',
            'Captcha after first conversion',
            '10 MB max file · 25 pages max',
            'All format pairs · UDS output',
            'No signup',
          ]}
          ctaLabel="Start converting"
          ctaHref="/"
          variant="plain"
        />

        {/* â”€â”€â”€ Plus â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TierCard
          tier="Plus"
          price="$0.97"
          priceSuffix="/month"
          subtitle="Unlimited single-file conversions."
          features={[
            'Unlimited conversions',
            'Up to 25 MB per file',
            'Up to 100 pages per file',
            'Up to 2 language translations',
            'No captcha',
            'All format pairs',
            'Cancel anytime',
          ]}
          ctaLabel={loading === 'plus_monthly' ? 'Loading…' : 'Subscribe to Plus'}
          ctaOnClick={() => startCheckout('plus_monthly')}
          ctaDisabled={loading !== null}
          variant="gold"
          ribbon="Best value"
        />

        {/* â”€â”€â”€ Pro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <TierCard
          tier="Pro"
          price="$29"
          priceSuffix="/month"
          subtitle="Unlimited everything. $249/year saves $99."
          features={[
            'Everything in Plus',
            'Up to 50 MB per file',
            'Batch ZIP convert',
            'API access',
            'Chain of custody logging',
            'Priority processing',
            'Cancel anytime',
          ]}
          ctaLabel={loading === 'monthly' ? 'Loading…' : 'Subscribe to Pro'}
          ctaOnClick={() => startCheckout('monthly')}
          ctaDisabled={loading !== null}
          variant="ink"
          ribbon={null}
          secondaryCta={{
            label: loading === 'yearly' ? 'Loading…' : 'Or $249/year — save $99',
            onClick: () => startCheckout('yearly'),
            disabled: loading !== null,
          }}
        />
      </div>

      {error && (
        <div style={{
          maxWidth: 540,
          margin: '0 auto 24px',
          padding: '12px 16px',
          background: 'rgba(226,75,74,0.08)',
          border: '1px solid rgba(226,75,74,0.25)',
          borderRadius: 10,
          color: 'var(--ud-danger, #c0392b)',
          fontSize: 14,
          textAlign: 'center',
        }}>{error}</div>
      )}

      <div style={{ textAlign: 'center', padding: '24px', background: 'var(--ud-paper-2, #f2f1ee)', borderRadius: 12, border: '0.5px solid var(--ud-border)' }}>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', marginBottom: 6 }}>
          Need enterprise volume, self-hosting, or custom integration?
        </p>
        <a href="mailto:press@universaldocument.solutions" style={{ fontSize: 14, fontWeight: 600, color: INK, textDecoration: 'none' }}>
          Contact Universal Document™ Incorporated →
        </a>
      </div>
    </main>
  )
}

type TierCardProps = {
  tier: string
  price: string
  priceSuffix?: string
  subtitle: string
  features: string[]
  ctaLabel: string
  ctaHref?: string
  ctaOnClick?: () => void
  ctaDisabled?: boolean
  variant: 'plain' | 'gold' | 'ink'
  ribbon?: string | null
  secondaryCta?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

function TierCard(p: TierCardProps) {
  const isInk = p.variant === 'ink'
  const isGold = p.variant === 'gold'
  return (
    <div style={{
      position: 'relative',
      background: isInk ? INK : '#fff',
      border: isGold ? `2px solid ${GOLD}` : '0.5px solid var(--ud-border)',
      borderRadius: 12,
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isGold ? '0 8px 32px rgba(212,175,55,0.18)' : 'var(--ud-shadow, 0 2px 12px rgba(0,0,0,0.06))',
    }}>
      {p.ribbon && (
        <div style={{
          position: 'absolute',
          top: -12,
          right: 16,
          background: GOLD,
          color: INK,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: 6,
        }}>{p.ribbon}</div>
      )}
      <p style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: isInk ? GOLD : 'var(--ud-muted)',
        marginBottom: 16,
      }}>{p.tier}</p>
      <p style={{ fontSize: 36, fontWeight: 700, color: isInk ? '#fff' : INK, marginBottom: 2 }}>
        {p.price}{p.priceSuffix && <span style={{ fontSize: 16, fontWeight: 400, opacity: 0.7 }}>{p.priceSuffix}</span>}
      </p>
      <p style={{ fontSize: 13, color: isInk ? 'rgba(255,255,255,0.6)' : 'var(--ud-muted)', marginBottom: 24 }}>{p.subtitle}</p>

      <div style={{ flex: 1, marginBottom: 24 }}>
        {p.features.map(f => (
          <div key={f} style={{
            fontSize: 14,
            color: isInk ? 'rgba(255,255,255,0.85)' : INK,
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            marginBottom: 10,
            lineHeight: 1.5,
          }}>
            <span style={{ color: isInk ? GOLD : 'var(--ud-teal, #0a7a6a)', fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span>{f}</span>
          </div>
        ))}
      </div>

      {p.ctaHref ? (
        <a href={p.ctaHref} style={{ ...ctaButtonStyle(p.variant), pointerEvents: p.ctaDisabled ? 'none' : 'auto', opacity: p.ctaDisabled ? 0.6 : 1 } as React.CSSProperties}>
          {p.ctaLabel}
        </a>
      ) : (
        <button
          onClick={p.ctaOnClick}
          disabled={p.ctaDisabled}
          style={{ ...ctaButtonStyle(p.variant), opacity: p.ctaDisabled ? 0.6 : 1, cursor: p.ctaDisabled ? 'not-allowed' : 'pointer' } as React.CSSProperties}
        >
          {p.ctaLabel}
        </button>
      )}

      {p.secondaryCta && (
        <button
          onClick={p.secondaryCta.onClick}
          disabled={p.secondaryCta.disabled}
          style={{
            background: 'transparent',
            color: isInk ? 'rgba(255,255,255,0.6)' : 'var(--ud-muted)',
            border: 'none',
            fontSize: 12,
            cursor: p.secondaryCta.disabled ? 'not-allowed' : 'pointer',
            marginTop: 10,
            textDecoration: 'underline',
            padding: 4,
          }}
        >
          {p.secondaryCta.label}
        </button>
      )}
    </div>
  )
}

function ctaButtonStyle(variant: 'plain' | 'gold' | 'ink'): React.CSSProperties {
  if (variant === 'gold') return {
    background: GOLD,
    color: INK,
    border: 'none',
    borderRadius: 10,
    padding: '14px 0',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 48,
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  }
  if (variant === 'ink') return {
    background: '#fff',
    color: INK,
    border: 'none',
    borderRadius: 10,
    padding: '14px 0',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    minHeight: 48,
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  }
  return {
    background: 'transparent',
    color: INK,
    border: '1px solid var(--ud-border)',
    borderRadius: 10,
    padding: '14px 0',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    minHeight: 48,
    textAlign: 'center',
    textDecoration: 'none',
    display: 'block',
  }
}

