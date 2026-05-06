'use client'

// Paywall modal shown when a free user hits the daily/lifetime conversion
// cap. Two CTAs: Plus ($0.97/mo) and Pro ($29/mo). Both link to /pricing
// today — PR D wires Stripe checkout for the Plus tier, Pro stays on the
// existing checkout flow.
//
// Per Sonny's spec: when a free user hits their 3rd lifetime conversion,
// the convert button is disabled and this modal shows. Today, the cap
// reflects the current /api/convert 5-files-per-DAY limit — PR D drops
// it to 1/day with a 3-lifetime ceiling.

import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'
const INK = '#1e2d3d'

type Props = {
  open: boolean
  onClose: () => void
  /** Free conversions used by this client. Surfaced for context in the modal copy. */
  used?: number
  /** Server-supplied limit. */
  limit?: number
}

export function PaywallModal({ open, onClose, used, limit }: Props) {
  const s = useStrings()
  if (!open) return null

  // Body copy: three branches depending on whether we got structured
  // {used, limit} fields back from the rate-limit gate. Singular vs
  // plural via the catalog's two templates so the localized engine
  // doesn't have to do English-style "1 conversion" / "N conversions"
  // pluralization in the consumer.
  let bodyMain: string
  if (used !== undefined && limit !== undefined) {
    const tpl = used === 1
      ? s.paywall.bodyUsedTemplateSingular
      : s.paywall.bodyUsedTemplatePlural
    bodyMain = tpl.replace('{{used}}', String(used)).replace('{{limit}}', String(limit))
  } else {
    bodyMain = s.paywall.bodyFallback
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={s.paywall.ariaLabel}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 14,
          padding: '24px 22px',
          maxWidth: 420,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 700, color: INK }}>
          {s.paywall.title}
        </div>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--ud-muted)' }}>
          {bodyMain}{' '}{s.paywall.bodySuffix}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          <a href="/pricing" style={{ ...primaryCtaStyle, background: GOLD }} aria-label={s.paywall.plusAria}>
            <strong>{s.paywall.plusTitle}</strong>
            <span style={subText}>{s.paywall.plusBody}</span>
          </a>
          <a href="/pricing" style={{ ...primaryCtaStyle, background: INK, color: '#fff' }} aria-label={s.paywall.proAria}>
            <strong>{s.paywall.proTitle}</strong>
            <span style={{ ...subText, color: 'rgba(255,255,255,0.7)' }}>{s.paywall.proBody}</span>
          </a>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: 'var(--ud-muted)',
            border: 'none',
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 4,
            padding: 8,
          }}
        >
          {s.paywall.dismiss}
        </button>
      </div>
    </div>
  )
}

const primaryCtaStyle: React.CSSProperties = {
  color: INK,
  textDecoration: 'none',
  borderRadius: 10,
  padding: '14px 18px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 14,
  minHeight: 44,
}

const subText: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 400,
  opacity: 0.85,
}
