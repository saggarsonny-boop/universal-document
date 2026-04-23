export default function PricingPage() {
  const card = {
    base: {
      background: '#fff',
      border: '0.5px solid var(--ud-border)',
      borderRadius: 12,
      padding: '32px 28px',
      boxShadow: 'var(--ud-shadow)',
    } as React.CSSProperties,
    featured: {
      background: 'var(--ud-ink)',
      border: 'none',
      borderRadius: 12,
      padding: '32px 28px',
    } as React.CSSProperties,
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700, color: 'var(--ud-ink)', letterSpacing: '-0.02em', marginBottom: 14 }}>
          Simple pricing.
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--ud-muted)', maxWidth: 480, margin: '0 auto' }}>
          Free forever for individuals. Pro for teams and power users.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 860, margin: '0 auto 56px' }}>

        {/* Free */}
        <div style={card.base}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ud-muted)', marginBottom: 16 }}>Free</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>$0</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 28 }}>Always. No card required.</p>
          {[
            '5 conversions per day',
            'DOCX, TXT, Markdown, CSV',
            'Download as .uds',
            'Basic metadata',
            'No account required',
          ].map(f => (
            <div key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ color: 'var(--ud-teal)', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
            </div>
          ))}
          <a href="https://converter.hive.baby" style={{
            display: 'block', marginTop: 28, padding: '11px 0', textAlign: 'center',
            border: '1px solid var(--ud-border)', borderRadius: 8, textDecoration: 'none',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: 'var(--ud-ink)',
          }}>Start converting →</a>
        </div>

        {/* Pro Monthly */}
        <div style={card.featured}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ud-gold)', marginBottom: 16 }}>Pro</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 4 }}>$29<span style={{ fontSize: 16, fontWeight: 400, opacity: 0.7 }}>/month</span></p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 28 }}>Or $249/year — save $99.</p>
          {[
            'Unlimited conversions',
            'Batch convert (ZIP upload)',
            'Up to 50 MB per file',
            'Full metadata + expiry controls',
            'Chain of custody logging',
            'API access',
            'Priority processing',
          ].map(f => (
            <div key={f} style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(255,255,255,0.85)', display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
              <span style={{ color: 'var(--ud-gold)', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
            </div>
          ))}
          <a href="mailto:press@universaldocument.solutions?subject=Pro%20enquiry" style={{
            display: 'block', marginTop: 28, padding: '11px 0', textAlign: 'center',
            background: 'var(--ud-gold)', borderRadius: 8, textDecoration: 'none',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 14, color: '#fff',
          }}>Get Pro →</a>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 10 }}>Annual billing available at checkout.</p>
        </div>

      </div>

      <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--ud-paper-2)', borderRadius: 12, border: '0.5px solid var(--ud-border)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', marginBottom: 8 }}>
          Need enterprise volume, self-hosting, or custom integration?
        </p>
        <a href="mailto:press@universaldocument.solutions" style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', textDecoration: 'none' }}>
          Contact Universal Document™ Incorporated →
        </a>
      </div>
    </main>
  )
}
