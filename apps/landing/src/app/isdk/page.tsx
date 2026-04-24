export default function ISDKPage() {
  const code = `<script src="https://ud.hive.baby/isdk/ud-isdk.js"></script>
<ud-reader src="your-document.uds"></ud-reader>
<link rel="stylesheet" href="https://ud.hive.baby/isdk/ud-isdk.css">`

  const s = {
    page: { maxWidth: 860, margin: '0 auto', padding: '72px 24px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' } as React.CSSProperties,
    h1: { fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 10 } as React.CSSProperties,
    sub: { fontSize: 17, color: 'var(--ud-muted)', lineHeight: 1.7, marginBottom: 40, maxWidth: 600 } as React.CSSProperties,
    card: { background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', padding: '24px 28px', marginBottom: 20, boxShadow: 'var(--ud-shadow)' } as React.CSSProperties,
    h2: { fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 12 } as React.CSSProperties,
    pre: { background: 'var(--ud-ink)', color: '#e2e8f0', borderRadius: 'var(--ud-radius)', padding: '18px 20px', fontSize: 13, fontFamily: 'var(--font-mono)', overflowX: 'auto' as const, lineHeight: 1.7, marginTop: 8 } as React.CSSProperties,
    label: { fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 4, display: 'block' as const } as React.CSSProperties,
  }

  const features = [
    { icon: '📖', title: 'Render any .uds or .udr file', desc: 'Full block-level rendering — headings, paragraphs, lists, dividers — with correct typography.' },
    { icon: '✦', title: 'Clarity Layer switching', desc: 'Built-in tabs for patient_summary, clinical, legal, and any custom clarity layer embedded in the document.' },
    { icon: '🔗', title: 'Chain-of-custody panel', desc: 'Show the full provenance timeline: creation, sealing, translation, watermarking, revocation.' },
    { icon: '⏳', title: 'Expiry & revocation', desc: 'Automatically checks expiry and revocation state. Shows a clear banner when a document is expired or revoked.' },
    { icon: '🌐', title: 'Multilingual', desc: 'Switches between language streams embedded in the document.' },
    { icon: '🎨', title: 'Light · Dark · Auto', desc: 'Respects system preference by default. Override with the theme attribute.' },
  ]

  return (
    <div style={s.page}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← Back to UD Hub</a>

      <h1 style={s.h1}>Universal Document™ iSDK</h1>
      <p style={s.sub}>Embed the Universal Document™ Reader in any web application. Three lines. No backend required. Handles rendering, expiry, revocation, clarity layers, and chain-of-custody automatically.</p>

      {/* Download */}
      <div style={{ ...s.card, border: '2px solid var(--ud-gold)', background: 'var(--ud-gold-3)', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' as const }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>iSDK v1.0 — Download package</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.6 }}>README · LICENSE (Apache 2.0) · sample.uds · integration guide</div>
          </div>
          <a href="/isdk/ud-isdk-v1.0.zip" download style={{ padding: '13px 24px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 700, fontSize: 15, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap' as const }}>
            Download ud-isdk-v1.0.zip →
          </a>
        </div>
      </div>

      {/* Three-line embed */}
      <div style={s.card}>
        <h2 style={s.h2}>Three-line embed</h2>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', marginBottom: 8 }}>Drop into any HTML page. No build step required.</p>
        <pre style={s.pre}>{code}</pre>
      </div>

      {/* Features grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
        {features.map(f => (
          <div key={f.title} style={s.card}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 4 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.5 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* API reference */}
      <div style={s.card}>
        <h2 style={s.h2}>JavaScript API</h2>
        <pre style={s.pre}>{`const reader = document.querySelector('ud-reader')

// Load a document
reader.load('path/to/document.uds')

// Get metadata
const meta = await reader.getMetadata()
// → { title, format, status, expires_at, revoked, ... }

// Switch clarity layer
reader.setLayer('patient_summary')

// Events
reader.addEventListener('ud:loaded',  e => console.log(e.detail))
reader.addEventListener('ud:expired', () => console.log('Expired'))
reader.addEventListener('ud:revoked', () => console.log('Revoked'))`}</pre>
      </div>

      {/* Attributes */}
      <div style={s.card}>
        <h2 style={s.h2}>Attributes</h2>
        <div style={{ overflowX: 'auto' as const }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--ud-border)' }}>
              {['Attribute','Type','Default','Description'].map(h => <th key={h} style={{ textAlign: 'left' as const, padding: '8px 12px', color: 'var(--ud-muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[
                ['src','string','—','URL or path to .uds or .udr file'],
                ['theme','"light"|"dark"|"auto"','"auto"','Colour scheme'],
                ['lang','string','doc default','Preferred language code'],
                ['show-chain','boolean','false','Show chain-of-custody panel'],
                ['readonly','boolean','false','Disable editing for .udr files'],
              ].map(([attr,type,def,desc]) => (
                <tr key={attr as string} style={{ borderBottom: '1px solid var(--ud-border)' }}>
                  <td style={{ padding: '10px 12px', color: 'var(--ud-gold)', fontWeight: 600 }}>{attr}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ud-teal)' }}>{type}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ud-muted)' }}>{def}</td>
                  <td style={{ padding: '10px 12px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 32, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', textAlign: 'center' }}>
        Apache 2.0 · Universal Document™ is a pending trademark · <a href="mailto:hive@hive.baby" style={{ color: 'var(--ud-teal)' }}>hive@hive.baby</a>
      </div>
    </div>
  )
}
