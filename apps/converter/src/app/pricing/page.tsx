'use client'
import { useState } from 'react'

const FREE_FEATURES = [
  '5 conversions per day',
  'DOCX, TXT, MD → .uds',
  'Max 10 MB per file',
  'Standard UDS output',
  'UD Reader compatible',
]

const PRO_FEATURES = [
  'Unlimited conversions',
  'Batch upload (ZIP in, ZIP out)',
  'Files up to 50 MB',
  'API access with key',
  'All translation languages',
  'Custom metadata templates',
  'Chain of custody logging',
  'Priority processing',
]

const ENTERPRISE_FEATURES = [
  'Custom pricing',
  'Dedicated API endpoint',
  'SLA documentation',
  'Archive migration service',
  'Custom metadata schema',
  'On-premise deployment',
  'Dedicated support',
]

const C = {
  page: { minHeight: '100vh', background: '#f9fafb', paddingBottom: 80 } as React.CSSProperties,
  hero: { textAlign: 'center' as const, padding: '56px 24px 40px' },
  h1: { fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', marginBottom: 12 },
  sub: { fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' },
  toggle: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 } as React.CSSProperties,
  toggleLabel: { fontSize: 14, color: '#374151', fontWeight: 500 },
  toggleBtn: (active: boolean): React.CSSProperties => ({
    position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer',
    background: active ? '#2563eb' : '#d1d5db', borderRadius: 12, border: 'none',
    transition: 'background 0.2s',
  }),
  toggleThumb: (active: boolean): React.CSSProperties => ({
    position: 'absolute', top: 3, left: active ? 23 : 3, width: 18, height: 18,
    background: 'white', borderRadius: '50%', transition: 'left 0.2s',
  }),
  savings: { fontSize: 12, background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: 20, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 960, margin: '0 auto', padding: '0 24px' } as React.CSSProperties,
  card: (highlight: boolean): React.CSSProperties => ({
    background: highlight ? '#1e3a5f' : '#ffffff',
    border: highlight ? 'none' : '1px solid #e5e7eb',
    borderRadius: 16, padding: '32px 28px', position: 'relative',
  }),
  badge: { position: 'absolute' as const, top: -12, left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#000', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' as const, letterSpacing: '0.05em' },
  tier: (highlight: boolean) => ({ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: highlight ? 'rgba(255,255,255,0.6)' : '#9ca3af', textTransform: 'uppercase' as const, marginBottom: 8 }),
  price: (highlight: boolean) => ({ fontSize: 36, fontWeight: 800, color: highlight ? '#ffffff' : '#111827', letterSpacing: '-0.02em', marginBottom: 4 }),
  pricePer: (highlight: boolean) => ({ fontSize: 13, color: highlight ? 'rgba(255,255,255,0.5)' : '#9ca3af', marginBottom: 24 }),
  btn: (highlight: boolean, outline?: boolean): React.CSSProperties => ({
    width: '100%', padding: '12px 0', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
    border: outline ? '1px solid rgba(255,255,255,0.3)' : 'none',
    background: highlight ? (outline ? 'transparent' : '#f59e0b') : '#2563eb',
    color: highlight ? '#ffffff' : '#ffffff',
    marginBottom: 24,
  }),
  featureList: { listStyle: 'none', display: 'flex', flexDirection: 'column' as const, gap: 10 },
  feature: (highlight: boolean) => ({ fontSize: 14, color: highlight ? 'rgba(255,255,255,0.85)' : '#374151', display: 'flex', gap: 8, alignItems: 'flex-start' as const }),
  checkmark: (highlight: boolean) => ({ color: highlight ? '#f59e0b' : '#22c55e', flexShrink: 0, marginTop: 1 }),
  divider: { maxWidth: 960, margin: '48px auto 0', padding: '0 24px', borderTop: '1px solid #e5e7eb' } as React.CSSProperties,
  enterprise: { padding: '48px 24px', textAlign: 'center' as const, maxWidth: 520, margin: '0 auto' },
  entForm: { display: 'flex', flexDirection: 'column' as const, gap: 12, textAlign: 'left' as const, marginTop: 24 },
  input: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%' } as React.CSSProperties,
  textarea: { padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', minHeight: 100, resize: 'vertical' as const } as React.CSSProperties,
  submitBtn: { background: '#111827', color: 'white', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', width: '100%' } as React.CSSProperties,
}

export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null)
  const [entSubmitted, setEntSubmitted] = useState(false)
  const [entEmail, setEntEmail] = useState('')
  const [entOrg, setEntOrg] = useState('')
  const [entMessage, setEntMessage] = useState('')

  async function subscribe(plan: 'monthly' | 'yearly') {
    setLoading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  async function submitEnterprise(e: React.FormEvent) {
    e.preventDefault()
    // Simple mailto fallback for now
    window.location.href = `mailto:hive@hive.baby?subject=Enterprise Inquiry — ${entOrg}&body=${encodeURIComponent(`Organisation: ${entOrg}\nEmail: ${entEmail}\n\n${entMessage}`)}`
    setEntSubmitted(true)
  }

  return (
    <div style={C.page}>
      <div style={C.hero}>
        <a href="/pricing" style={{ fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 24 }}>
          <a href="/" style={{ fontSize: 13, color: '#6b7280' }}>← Converter</a>
        </a>
        <h1 style={C.h1}>Simple, honest pricing</h1>
        <p style={C.sub}>Free forever at the base tier. Pro for serious document work. Enterprise for institutions.</p>

        <div style={C.toggle}>
          <span style={C.toggleLabel}>Monthly</span>
          <button style={C.toggleBtn(yearly)} onClick={() => setYearly(!yearly)} aria-label="Toggle billing period">
            <span style={C.toggleThumb(yearly)} />
          </button>
          <span style={C.toggleLabel}>Yearly</span>
          <span style={C.savings}>Save $99</span>
        </div>
      </div>

      <div style={C.grid}>
        {/* Free */}
        <div style={C.card(false)}>
          <p style={C.tier(false)}>Free</p>
          <p style={C.price(false)}>$0</p>
          <p style={C.pricePer(false)}>forever</p>
          <button style={{ ...C.btn(false), background: '#f3f4f6', color: '#374151' }} onClick={() => window.location.href = '/'}>
            Start converting
          </button>
          <ul style={C.featureList}>
            {FREE_FEATURES.map(f => (
              <li key={f} style={C.feature(false)}>
                <span style={C.checkmark(false)}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro */}
        <div style={C.card(true)}>
          <div style={C.badge}>MOST POPULAR</div>
          <p style={C.tier(true)}>Pro</p>
          <p style={C.price(true)}>{yearly ? '$249' : '$29'}</p>
          <p style={C.pricePer(true)}>per {yearly ? 'year' : 'month'} · billed {yearly ? 'annually' : 'monthly'}</p>
          <button
            style={C.btn(true)}
            onClick={() => subscribe(yearly ? 'yearly' : 'monthly')}
            disabled={!!loading}
          >
            {loading ? 'Redirecting…' : 'Subscribe to Pro'}
          </button>
          <ul style={C.featureList}>
            {PRO_FEATURES.map(f => (
              <li key={f} style={C.feature(true)}>
                <span style={C.checkmark(true)}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Enterprise */}
        <div style={C.card(false)}>
          <p style={C.tier(false)}>Enterprise</p>
          <p style={C.price(false)}>Custom</p>
          <p style={C.pricePer(false)}>contact us for pricing</p>
          <button style={{ ...C.btn(false), background: '#111827' }} onClick={() => document.getElementById('enterprise-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Contact us
          </button>
          <ul style={C.featureList}>
            {ENTERPRISE_FEATURES.map(f => (
              <li key={f} style={C.feature(false)}>
                <span style={C.checkmark(false)}>✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={C.divider}>
        <div id="enterprise-form" style={C.enterprise}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Enterprise enquiry</h2>
          <p style={{ fontSize: 14, color: '#6b7280' }}>For government, NHS, legal, and institutional use. We&apos;ll respond within one business day.</p>
          {entSubmitted ? (
            <p style={{ marginTop: 24, color: '#16a34a', fontWeight: 500 }}>Enquiry sent — we&apos;ll be in touch.</p>
          ) : (
            <form style={C.entForm} onSubmit={submitEnterprise}>
              <input style={C.input} type="email" placeholder="Your email" value={entEmail} onChange={e => setEntEmail(e.target.value)} required />
              <input style={C.input} type="text" placeholder="Organisation name" value={entOrg} onChange={e => setEntOrg(e.target.value)} required />
              <textarea style={C.textarea} placeholder="Briefly describe your use case…" value={entMessage} onChange={e => setEntMessage(e.target.value)} required />
              <button type="submit" style={C.submitBtn}>Send enquiry</button>
            </form>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 48, padding: '0 24px' }}>
        <p style={{ fontSize: 11, color: '#d1d5db', letterSpacing: '0.05em' }}>NO ADS · NO INVESTORS · NO AGENDA</p>
      </div>
    </div>
  )
}
