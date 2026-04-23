'use client'
export default function Revoke() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Revoke</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 40, lineHeight: 1.6 }}>
        Mark any Universal Document™ as revoked. Generates a revocation hash and embeds it in the document metadata. Compliant readers will display a revocation notice. Output includes the revoked .uds and a confirmation receipt.
      </p>
      <div style={{ padding: '48px 32px', background: 'var(--ud-paper-2)', border: '1.5px dashed var(--ud-border-2)', borderRadius: 'var(--ud-radius-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🚫</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>Coming soon</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)' }}>UD Revoke is under active development.</div>
      </div>
    </div>
  )
}
