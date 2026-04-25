'use client'
import { useState } from 'react'

const COMPARISON = [
  { feature: 'What it does',   isdk: 'Read and render .uds/.udr/.udz', csdk: 'Create, convert, sign, validate .uds files' },
  { feature: 'Cost',           isdk: 'Free forever',                    csdk: 'Paid tiers — early access pricing TBD' },
  { feature: 'Account',        isdk: 'No account needed',               csdk: 'API key required' },
  { feature: 'Who it\'s for',  isdk: 'Viewers and renderers',           csdk: 'Builders and creators' },
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

const USE_CASES = [
  'Healthcare / clinical documents',
  'Legal / contracts',
  'Government / public sector',
  'Academic / research',
  'Financial / compliance',
  'EdTech / credentialing',
  'Other',
]

export default function CSDKPage() {
  const [f, setF] = useState({ name: '', org: '', usecase: '', email: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await fetch('https://support.hive.baby/api/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: f.email,
          subject: 'cSDK Early Access',
          text: `Name: ${f.name}\nOrganisation: ${f.org}\nUse case: ${f.usecase}\nEmail: ${f.email}`,
        }),
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    border: '1px solid var(--ud-border)',
    borderRadius: 'var(--ud-radius)',
    fontFamily: 'var(--font-body)', fontSize: 14,
    color: 'var(--ud-ink)', background: '#fff',
    boxSizing: 'border-box',
  }
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600,
    fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
  }

  return (
    <main style={{ padding: '64px 24px 96px', maxWidth: 800, margin: '0 auto', width: '100%', fontFamily: 'var(--font-body)' }}>

      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40, textDecoration: 'none' }}>← Back to UD Hub</a>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
        UD Creator SDK
      </h1>
      <p style={{ fontSize: 17, color: 'var(--ud-muted)', lineHeight: 1.7, maxWidth: 600, marginBottom: 8 }}>
        API access for building with Universal Document™. Create, convert, sign, and validate .uds files programmatically.
      </p>
      <div style={{ display: 'inline-block', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-gold)', background: 'rgba(200,150,10,0.1)', border: '1px solid rgba(200,150,10,0.3)', borderRadius: 99, padding: '4px 12px', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 48 }}>
        Early Access — not yet publicly available
      </div>

      {/* iSDK vs cSDK */}
      <section style={{ marginBottom: 52 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 16 }}>iSDK vs cSDK</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--ud-border)' }}>
                <th style={{ textAlign: 'left', padding: '8px 14px', color: 'var(--ud-muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Feature</th>
                <th style={{ textAlign: 'left', padding: '8px 14px', color: 'var(--ud-teal)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>iSDK (now)</th>
                <th style={{ textAlign: 'left', padding: '8px 14px', color: 'var(--ud-gold)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>cSDK (coming)</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(row => (
                <tr key={row.feature} style={{ borderBottom: '1px solid var(--ud-border)' }}>
                  <td style={{ padding: '11px 14px', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--ud-ink)' }}>{row.isdk}</td>
                  <td style={{ padding: '11px 14px', color: 'var(--ud-ink)' }}>{row.csdk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* What you can build */}
      <section style={{ marginBottom: 52 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 16 }}>What you&apos;ll be able to build</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {WHAT_YOU_CAN_BUILD.map(item => (
            <div key={item} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: 'var(--ud-gold)', flexShrink: 0 }}>✦</span>
              <span style={{ fontSize: 13, color: 'var(--ud-ink)' }}>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Early access form */}
      <section style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>Request early access</h2>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', lineHeight: 1.6, marginBottom: 28 }}>
          We&apos;re building the cSDK with early partners. Tell us what you&apos;re building and we&apos;ll be in touch.
        </p>

        {status === 'sent' ? (
          <div style={{ padding: '20px 24px', background: 'rgba(20,180,120,0.06)', border: '1px solid rgba(20,180,120,0.3)', borderRadius: 'var(--ud-radius)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>Request received</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)' }}>
              Sonny will reply within 24 hours at {f.email}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={lbl}>Name *</label>
                <input style={inp} value={f.name} onChange={upd('name')} placeholder="Your name" required />
              </div>
              <div>
                <label style={lbl}>Organisation</label>
                <input style={inp} value={f.org} onChange={upd('org')} placeholder="Company / institution" />
              </div>
            </div>
            <div>
              <label style={lbl}>Use case *</label>
              <select style={{ ...inp }} value={f.usecase} onChange={upd('usecase')} required>
                <option value="">Select a use case</option>
                {USE_CASES.map(uc => <option key={uc} value={uc}>{uc}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Email *</label>
              <input type="email" style={inp} value={f.email} onChange={upd('email')} placeholder="you@example.com" required />
            </div>
            {status === 'error' && (
              <div style={{ padding: '10px 14px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', color: 'var(--ud-danger)', fontSize: 13 }}>
                Something went wrong. Email us directly at hive@hive.baby
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              style={{
                padding: '13px 24px',
                background: status === 'sending' ? 'var(--ud-border)' : 'var(--ud-ink)',
                color: status === 'sending' ? 'var(--ud-muted)' : '#fff',
                border: 'none', borderRadius: 'var(--ud-radius)',
                fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700,
                cursor: status === 'sending' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'sending' ? 'Sending…' : 'Request Access →'}
            </button>
          </form>
        )}
      </section>

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', marginTop: 48, paddingTop: 20, borderTop: '1px solid var(--ud-border)', lineHeight: 1.7 }}>
        No ads. No investors. No agenda. · Universal Document™
      </div>

    </main>
  )
}
