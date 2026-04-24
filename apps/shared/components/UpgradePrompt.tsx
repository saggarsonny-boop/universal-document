'use client'
import { useState } from 'react'
import { STRIPE_PRICES, formatPrice, getPaymentLink } from '../lib/pricing'

interface UpgradePromptProps {
  toolName: string
  requiredTier: string
  whatProUnlocks: string
}

export default function UpgradePrompt({ toolName, requiredTier, whatProUnlocks }: UpgradePromptProps) {
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly')
  const price = STRIPE_PRICES[requiredTier]
  const checkoutUrl = getPaymentLink(requiredTier, interval)

  return (
    <div style={{
      background: 'var(--ud-gold-3)',
      border: '1px solid var(--ud-gold)',
      borderRadius: 'var(--ud-radius-lg)',
      padding: '28px 28px 24px',
      textAlign: 'center',
      maxWidth: 480,
      margin: '32px auto',
    }}>
      <div style={{ fontSize: 28, marginBottom: 12 }}>✦</div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>
        {toolName} is a Pro feature
      </div>

      <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
        {whatProUnlocks}
      </div>

      {/* Beta notice */}
      <div style={{
        background: '#fff',
        border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius)',
        padding: '10px 16px',
        marginBottom: 20,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ud-teal)',
        letterSpacing: '0.04em',
      }}>
        ✦ FREE DURING BETA — no account required
      </div>

      {price && (
        <>
          {/* Interval toggle */}
          <div style={{ display: 'flex', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: 3, marginBottom: 16, width: 'fit-content', margin: '0 auto 16px' }}>
            {(['monthly', 'annual'] as const).map(iv => (
              <button
                key={iv}
                onClick={() => setInterval(iv)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 'calc(var(--ud-radius) - 2px)',
                  border: 'none',
                  background: interval === iv ? 'var(--ud-ink)' : 'transparent',
                  color: interval === iv ? '#fff' : 'var(--ud-muted)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transition: 'background 0.15s',
                }}
              >
                {iv === 'annual' ? 'Annual (save 15%)' : 'Monthly'}
              </button>
            ))}
          </div>

          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>
            {formatPrice(requiredTier, interval)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginBottom: 20 }}>
            {price.name} · {interval === 'annual' ? 'billed annually' : 'billed monthly'}
          </div>

          <a
            href={checkoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: '13px',
              background: 'var(--ud-ink)',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 'var(--ud-radius)',
              textDecoration: 'none',
              marginBottom: 12,
              transition: 'opacity 0.15s',
            }}
          >
            Upgrade to {price.name} →
          </a>
        </>
      )}

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginBottom: 28 }}>
        No ads. No investors. No agenda.
      </div>

      {/* Support add-on */}
      <div style={{ borderTop: '1px solid var(--ud-border)', paddingTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Priority Support — optional add-on
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          {[
            { label: '$1.99/mo', href: STRIPE_PRICES.ud_support_monthly?.paymentLink ?? 'https://support.hive.baby', sub: 'Monthly' },
            { label: '$19/yr',   href: STRIPE_PRICES.ud_support_annual?.paymentLinkAnnual ?? 'https://support.hive.baby', sub: 'Annual' },
            { label: '$5',       href: STRIPE_PRICES.ud_support_onetime?.paymentLink ?? 'https://support.hive.baby', sub: 'One-time' },
          ].map(opt => (
            <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '10px 16px', background: '#fff', border: '1px solid var(--ud-border)',
              borderRadius: 'var(--ud-radius)', textDecoration: 'none', minWidth: 80,
              transition: 'border-color 0.15s',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ud-ink)' }}>{opt.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-muted)', marginTop: 2 }}>{opt.sub}</span>
            </a>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-muted)' }}>
          Human response within 24 hours on any UD tool or engine
        </div>
      </div>
    </div>
  )
}
