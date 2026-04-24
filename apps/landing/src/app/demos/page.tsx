export const metadata = {
  title: 'Demo Files — Universal Document™',
  description: 'Download authentic UDS demonstration files. Open them in the UD Reader to experience Universal Document™ in action.',
}

const DEMOS = [
  {
    filename: 'pharmacy-prescription.uds',
    title: 'Pharmacy Prescription',
    subtitle: 'Maria Santos · Amoxicillin 500mg',
    desc: 'A sealed NHS prescription with five language streams (English, Arabic, Mandarin, Spanish, French) and two clarity layers — Patient and Pharmacist views. Expires 30 days from creation.',
    tags: ['5 languages', '2 clarity layers', 'expires in 30 days', 'healthcare'],
    color: '#1e2d3d',
  },
  {
    filename: 'clinical-consent.uds',
    title: 'Surgical Consent Form',
    subtitle: 'Appendectomy · 24-hour expiry',
    desc: 'A surgical consent document with patient-visible and clinician-restricted sections. English and Spanish. Expires 24 hours after creation — the UD Reader will show it as expired, demonstrating built-in time-limits.',
    tags: ['2 languages', 'audience layers', 'expires in 24h', 'healthcare'],
    color: '#0f5132',
  },
  {
    filename: 'original-contract.uds',
    title: 'Commercial Contract — Original',
    subtitle: '£50,000 · Harlow Digital / Meridian Group',
    desc: 'A sealed two-party commercial services agreement for £50,000. Valid, tamper-free. The UD Validator returns PASS. Compare against the tampered version below.',
    tags: ['commercial', 'sealed', 'PASS in Validator'],
    color: '#1e2d3d',
  },
  {
    filename: 'tampered-contract.uds',
    title: 'Commercial Contract — Tampered',
    subtitle: '£500,000 (altered) · REVOKED',
    desc: 'The same contract with the payment figure changed from £50,000 to £500,000 after sealing. The document is marked REVOKED and the seal hash does not match the content. Open in the UD Validator — it returns INVALID.',
    tags: ['tampered', 'revoked', 'FAIL in Validator'],
    color: '#7f1d1d',
  },
  {
    filename: 'this-article.uds',
    title: 'This Article — As a Universal Document™',
    subtitle: 'Part 2 · 5 languages · 1-year expiry',
    desc: 'The full text of the Medium Part 2 launch article, published as a UDS file. Five language streams, two clarity layers (Full Article and Executive Summary). Expires April 2027.',
    tags: ['5 languages', '2 clarity layers', 'expires 2027', 'article'],
    color: '#78350f',
  },
]

export default function DemosPage() {
  return (
    <div style={{ background: 'var(--ud-paper)', minHeight: '100vh', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '72px 24px 48px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', fontSize: 13, fontWeight: 600, letterSpacing: '0.12em',
          textTransform: 'uppercase', padding: '4px 14px', borderRadius: 20, marginBottom: 24,
          background: 'var(--ud-gold-3)', border: '1px solid rgba(200,150,10,0.3)', color: 'var(--ud-gold)',
          fontFamily: 'var(--font-mono)',
        }}>Demonstration Files</div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 700,
          letterSpacing: '-0.02em', color: 'var(--ud-ink)', marginBottom: 16, lineHeight: 1.2,
        }}>
          Universal Document™ in action
        </h1>
        <p style={{ fontSize: 16, color: 'var(--ud-muted)', lineHeight: 1.7, maxWidth: 520, margin: '0 auto 12px' }}>
          Five authentic <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, background: 'var(--ud-paper-2)', padding: '1px 6px', borderRadius: 4 }}>.uds</code> files demonstrating expiry, clarity layers, multilingual streams, and tamper detection.
          Open any file in the <a href="https://reader.hive.baby" style={{ color: 'var(--ud-gold)' }}>UD Reader</a>.
        </p>
        <p style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)' }}>
          reader.hive.baby · validator.hive.baby
        </p>
      </div>

      {/* File cards */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {DEMOS.map(demo => (
            <div key={demo.filename} style={{
              background: '#fff', border: '0.5px solid var(--ud-border)',
              borderRadius: 12, padding: '24px 28px', boxShadow: 'var(--ud-shadow)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                {/* File icon */}
                <div style={{
                  width: 44, height: 54, background: demo.color, borderRadius: 4, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 3,
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#c8960a', letterSpacing: 1 }}>UDS</span>
                  <div style={{ width: 24, height: 0.5, background: 'rgba(200,150,10,0.5)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 5, color: 'rgba(200,150,10,0.7)', letterSpacing: 0.5, textAlign: 'center', lineHeight: 1.3 }}>UNIVERSAL{'\n'}DOCUMENT</span>
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 2 }}>
                    {demo.title}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 10 }}>
                    {demo.subtitle}
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.6, margin: '0 0 12px' }}>
                    {demo.desc}
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                    {demo.tags.map(tag => (
                      <span key={tag} style={{
                        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 8,
                        background: 'var(--ud-paper-2)', color: 'var(--ud-muted)',
                        border: '0.5px solid var(--ud-border)',
                      }}>{tag}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a
                      href={`/demos/${demo.filename}`}
                      download={demo.filename}
                      style={{
                        display: 'inline-block', padding: '8px 16px', background: 'var(--ud-ink)',
                        color: '#fff', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                        borderRadius: 8, textDecoration: 'none',
                      }}
                    >
                      ↓ Download .uds
                    </a>
                    <a
                      href="https://reader.hive.baby"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block', padding: '8px 16px', background: 'transparent',
                        color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                        borderRadius: 8, textDecoration: 'none', border: '1px solid var(--ud-border)',
                      }}
                    >
                      Open in Reader →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: 48, padding: '24px 28px', background: 'var(--ud-paper-2)',
          border: '0.5px solid var(--ud-border)', borderRadius: 12,
        }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--ud-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>How to use these files</p>
          <ol style={{ paddingLeft: 18, margin: 0 }}>
            {[
              'Download a .uds file using the button above.',
              'Go to reader.hive.baby and open the file.',
              'Use the language switcher to switch between language streams.',
              'Use the clarity layer switcher to change audience (Patient / Pharmacist etc.).',
              'Open tampered-contract.uds in validator.hive.baby to see the REVOKED flag.',
            ].map((step, i) => (
              <li key={i} style={{ fontSize: 13, color: 'var(--ud-muted)', lineHeight: 1.8, marginBottom: 4 }}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
