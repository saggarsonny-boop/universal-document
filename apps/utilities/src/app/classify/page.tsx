'use client'
export default function Classify() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Classify</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 40, lineHeight: 1.6 }}>
        Claude reads your document and assigns a sensitivity classification: Public, Internal, Confidential, or Restricted — with reasoning. The classification is embedded as metadata in the output .uds file.
      </p>
      <div style={{ padding: '48px 32px', background: 'var(--ud-paper-2)', border: '1.5px dashed var(--ud-border-2)', borderRadius: 'var(--ud-radius-xl)', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🏷</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 8 }}>Coming soon</div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)' }}>AI document classification is under active development. Free during beta.</div>
      </div>
    </div>
  )
}
