'use client'

const COMPARISON = [
  { feature: 'What it does',       isdk: 'Read and render .uds/.udr/.udz', csdk: 'Create, convert, sign, validate .uds files' },
  { feature: 'Cost',               isdk: 'Free forever',                    csdk: 'Paid tiers — see below' },
  { feature: 'Account',            isdk: 'No account needed',               csdk: 'API key required' },
  { feature: 'Binary size',        isdk: 'Under 400KB',                     csdk: 'Full SDK + API access' },
  { feature: 'Who it\'s for',      isdk: 'Viewers and renderers',           csdk: 'Builders and creators' },
]

const WHAT_YOU_CAN_BUILD = [
  'Document creation pipelines',
  'Automated conversion workflows',
  'Signing and validation services',
  'Healthcare document systems',
  'Legal document automation',
  'Government document issuance',
  'EdTech credential platforms',
]

const API_ENDPOINTS = [
  { method: 'POST', path: '/convert',      desc: 'Convert any format to .uds' },
  { method: 'POST', path: '/seal',         desc: 'Convert .udr to sealed .uds' },
  { method: 'POST', path: '/sign',         desc: 'Add cryptographic signature layer' },
  { method: 'POST', path: '/validate',     desc: 'Verify document integrity' },
  { method: 'POST', path: '/translate',    desc: 'Multilingual output stream' },
  { method: 'POST', path: '/bundle',       desc: 'Create .udz archive' },
  { method: 'POST', path: '/intelligence', desc: 'AI-powered document analysis' },
]

const TIERS = [
  {
    key: 'csdk_lite',
    name: 'cSDK Lite',
    price: '$499',
    unit: '/mo',
    features: ['Up to 10,000 conversions/month', 'All core API endpoints', 'Email support'],
    cta: 'Request Access',
  },
  {
    key: 'csdk_pro',
    name: 'cSDK Pro',
    price: '$999',
    unit: '/mo',
    features: ['Up to 100,000 conversions/month', 'Priority support', 'Webhook events', 'Custom metadata schemas'],
    cta: 'Request Access',
    highlight: true,
  },
  {
    key: 'csdk_scale',
    name: 'cSDK Scale',
    price: '$2,999',
    unit: '/mo',
    features: ['Unlimited conversions', 'Dedicated infrastructure', 'SLA guarantee', 'Custom integration support'],
    cta: 'Request Access',
  },
]

const ACCESS_HREF = 'mailto:hive@hive.baby?subject=cSDK Access Request'

export default function CSDKPage() {
  return (
    <main style={{ padding: '64px 24px 96px', maxWidth: 900, margin: '0 auto', width: '100%', fontFamily: 'var(--font-body)' }}>

      {/* Back */}
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40, textDecoration: 'none' }}>← Back to UD Hub</a>

      {/* Hero */}
      <div style={{ marginBottom: 56 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
          UD Creator SDK
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ud-muted)', lineHeight: 1.7, maxWidth: 600, marginBottom: 28 }}>
          Integrate Universal Document™ creation, conversion, signing, and validation into your product. API-first. Production-ready.
        </p>
        <a href={ACCESS_HREF} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 28px',
          background: 'var(--ud-ink)', color: '#fff',
          fontWeight: 700, fontSize: 15,
          borderRadius: 'var(--ud-radius)',
          textDecoration: 'none',
          transition: 'opacity 0.15s',
        }}>
          Request cSDK Access →
        </a>
      </div>

      {/* iSDK vs cSDK */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 20 }}>iSDK vs cSDK</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ud-border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ud-muted)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Feature</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ud-teal)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>iSDK</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: 'var(--ud-gold)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>cSDK</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(row => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--ud-border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ud-ink)' }}>{row.isdk}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--ud-ink)' }}>{row.csdk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What you can build */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 20 }}>What you can build</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {WHAT_YOU_CAN_BUILD.map(item => (
            <div key={item} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--ud-gold)', flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 14, color: 'var(--ud-ink)' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* API Capabilities */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 20 }}>API Capabilities</h2>
        <div style={{ background: 'var(--ud-ink)', borderRadius: 'var(--ud-radius-lg)', padding: '20px 24px' }}>
          {API_ENDPOINTS.map(ep => (
            <div key={ep.path} style={{ display: 'flex', alignItems: 'baseline', gap: 16, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-teal)', fontWeight: 600, letterSpacing: '0.04em', minWidth: 40 }}>{ep.method}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e2e8f0', minWidth: 140 }}>{ep.path}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(226,232,240,0.6)' }}>{ep.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 20 }}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
          {TIERS.map(tier => (
            <div key={tier.key} style={{
              background: tier.highlight ? 'var(--ud-gold-3)' : 'var(--ud-paper-2)',
              border: `1px solid ${tier.highlight ? 'var(--ud-gold)' : 'var(--ud-border)'}`,
              borderRadius: 'var(--ud-radius-lg)',
              padding: '24px',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{tier.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 16 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)' }}>{tier.price}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{tier.unit}</span>
              </div>
              <ul style={{ margin: '0 0 20px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {tier.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: 'var(--ud-ink)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--ud-teal)', flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href={ACCESS_HREF} style={{
                display: 'block', textAlign: 'center', padding: '11px',
                background: 'var(--ud-ink)', color: '#fff',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                borderRadius: 'var(--ud-radius)', textDecoration: 'none',
              }}>
                {tier.cta} →
              </a>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)', textAlign: 'center' }}>
          Enterprise pricing and custom contracts available.{' '}
          <a href="mailto:hive@hive.baby" style={{ color: 'var(--ud-teal)', textDecoration: 'none' }}>Contact hive@hive.baby</a>
        </p>
      </section>

      {/* Final CTA */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 12 }}>Ready to build?</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)', marginBottom: 24, maxWidth: 480, margin: '0 auto 24px' }}>
          Email us with your use case and we&apos;ll set up API access within 24 hours.
        </p>
        <a href={ACCESS_HREF} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 28px',
          background: 'var(--ud-ink)', color: '#fff',
          fontWeight: 700, fontSize: 15,
          borderRadius: 'var(--ud-radius)',
          textDecoration: 'none',
        }}>
          Request Access →
        </a>
      </div>

    </main>
  )
}
