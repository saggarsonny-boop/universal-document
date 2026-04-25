// Abstract sourced from ssrn_metadata.txt — update when SSRN submission number is confirmed
const ABSTRACT = `The dominant document substrate — the Portable Document Format (PDF), ratified in 1993 — was engineered for print fidelity, not digital utility. Thirty years of adoption have produced a format that is universally consumed but structurally opaque: text encoded as positioned glyphs, semantics absent at the byte level, and provenance entirely external to the file. Universal Document™ (UD) is a first-principles redesign of the digital document substrate.

This working paper specifies Universal Document™ Standard 1.0: a structured, block-semantic, tamper-evident, AI-native document format comprising three file types — .uds (Sealed), .udr (Revisable), and .udz (Bundle) — and an open governance model released under CC BY 4.0. UD documents carry embedded provenance, cryptographic signing, optional expiry metadata, and machine-readable multilingual output as first-class schema properties rather than external annotations.

The format is designed to be platform-independent and cryptographically verifiable without reference to any external service or database. We argue that document integrity, semantic accessibility, and AI-readability are not features to be layered atop a legacy format, but properties that must be structurally guaranteed at the specification level. Universal Document™ Standard 1.0 is submitted as an open specification, free to implement. The iSDK (Infrastructure SDK) is available at zero cost, with no attribution requirement and zero telemetry.`

const METADATA = [
  { label: 'Published by', value: 'Universal Document™ Incorporated' },
  { label: 'Date', value: 'April 2026' },
  { label: 'Specification', value: 'Universal Document™ Standard 1.0' },
  { label: 'License', value: 'CC BY 4.0' },
  { label: 'Contact', value: 'hive@hive.baby', href: 'mailto:hive@hive.baby' },
  { label: 'JEL Classification', value: 'K19 · K29 · L86 · O33 · O38 · L17 · M15 · I18' },
  { label: 'Keywords', value: 'document format, open standard, PDF successor, document governance, AI-native documents' },
]

export default function WhitepaperPage() {
  return (
    <main style={{ padding: '72px 24px 96px', maxWidth: 760, margin: '0 auto', width: '100%' }}>

      {/* Publisher line */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ud-gold)',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontVariant: 'small-caps',
        marginBottom: 32,
        textAlign: 'center',
      }}>
        Universal Document™ Standard 1.0 · Working Paper · April 2026
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(32px, 5vw, 52px)',
        fontWeight: 700,
        color: 'var(--ud-ink)',
        marginBottom: 12,
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        textAlign: 'center',
      }}>
        Universal Document™:
      </h1>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 3vw, 28px)',
        fontStyle: 'italic',
        color: 'var(--ud-gold)',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 1.3,
      }}>
        What Documents Were Always Supposed to Be
      </div>

      {/* Gold divider */}
      <div style={{ height: 1, background: 'var(--ud-gold)', opacity: 0.4, marginBottom: 36 }} />

      {/* Metadata block */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ud-muted)',
        marginBottom: 36,
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '6px 20px',
        alignItems: 'baseline',
      }}>
        {METADATA.map(m => (
          <>
            <span key={`${m.label}-k`} style={{ color: 'var(--ud-muted)', opacity: 0.6, whiteSpace: 'nowrap' }}>{m.label}:</span>
            <span key={`${m.label}-v`} style={{ color: 'var(--ud-ink)' }}>
              {m.href
                ? <a href={m.href} style={{ color: 'var(--ud-teal)', textDecoration: 'none' }}>{m.value}</a>
                : m.value
              }
            </span>
          </>
        ))}
      </div>

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 52, flexWrap: 'wrap' }}>
        <a
          href="/whitepaper/universal-document-whitepaper-v2.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px',
            background: 'var(--ud-gold)',
            color: '#1e2d3d',
            fontFamily: 'var(--font-body)',
            fontSize: 14, fontWeight: 700,
            borderRadius: 'var(--ud-radius)',
            textDecoration: 'none',
            transition: 'opacity 0.15s',
          }}
        >
          Download PDF →
        </a>
        <a
          href="https://ssrn.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px',
            background: 'transparent',
            color: 'var(--ud-ink)',
            fontFamily: 'var(--font-body)',
            fontSize: 14, fontWeight: 600,
            borderRadius: 'var(--ud-radius)',
            border: '1px solid var(--ud-border)',
            textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}
        >
          Read on SSRN →
        </a>
      </div>

      {/* Gold divider */}
      <div style={{ height: 1, background: 'var(--ud-gold)', opacity: 0.4, marginBottom: 40 }} />

      {/* Abstract */}
      <section style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ud-gold)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Abstract
        </div>
        {ABSTRACT.split('\n\n').map((para, i) => (
          <p key={i} style={{
            fontFamily: 'var(--font-body)',
            fontSize: 16,
            color: 'var(--ud-ink)',
            lineHeight: 1.75,
            marginBottom: 20,
          }}>
            {para}
          </p>
        ))}
      </section>

      {/* JEL Classification */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ud-muted)',
        marginBottom: 48,
        padding: '14px 18px',
        background: 'var(--ud-paper-2)',
        border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius)',
      }}>
        <span style={{ color: 'var(--ud-muted)', opacity: 0.6 }}>JEL Classification: </span>
        K19 · K29 · L86 · O33 · O38 · L17 · M15 · I18
      </div>

      {/* Gold divider */}
      <div style={{ height: 1, background: 'var(--ud-gold)', opacity: 0.4, marginBottom: 40 }} />

      {/* Trademark notice */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ud-muted)',
        lineHeight: 1.7,
        padding: '18px 20px',
        background: 'var(--ud-paper-2)',
        border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius)',
      }}>
        Universal Document™ is a trademark, application pending (USPTO Serial No. 99774346, filed April 20, 2026). The specification is released under{' '}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ud-teal)', textDecoration: 'none' }}>CC BY 4.0</a>
        {' '}and may be implemented freely by any party.
      </div>

    </main>
  )
}
