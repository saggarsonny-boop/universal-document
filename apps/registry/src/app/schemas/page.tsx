import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Schemas — Universal Document Schema Registry',
  description: 'Browse published JSON Schema definitions for Universal Document™ document types.',
}

const CORE_SCHEMAS = [
  {
    id: 'isdf.dev/schemas/v0.1.0/ud.schema.json',
    title: 'Universal Document (UD) — iSDF v0.1.0',
    maturity: '1',
    maturityLabel: 'Recommended',
    version: '0.1.0',
    license: 'CC BY 4.0',
    domain: 'Core',
  },
]

export default function SchemasPage() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 96px' }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ud-gold)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: 12,
      }}>
        Catalogue
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(28px, 4vw, 40px)',
        fontWeight: 700,
        color: 'var(--ud-ink)',
        marginBottom: 12,
      }}>
        Published schemas
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        color: 'var(--ud-muted)',
        lineHeight: 1.7,
        marginBottom: 32,
        maxWidth: 640,
      }}>
        Domain schemas will appear here as they pass review. The core iSDF schema is available now.
        To register a new schema, follow the process in the{' '}
        <Link href="/governance" style={{ color: 'var(--ud-teal)' }}>governance model</Link>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {CORE_SCHEMAS.map((schema) => (
          <div key={schema.id} style={{
            background: '#fff',
            border: '1px solid var(--ud-border)',
            borderRadius: 'var(--ud-radius-lg)',
            padding: '22px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--ud-teal-2)',
                    color: 'var(--ud-teal)',
                  }}>
                    MATURITY {schema.maturity} · {schema.maturityLabel.toUpperCase()}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: 'var(--ud-paper-2)',
                    color: 'var(--ud-muted)',
                  }}>
                    {schema.domain}
                  </span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--ud-ink)',
                  marginBottom: 6,
                }}>
                  {schema.title}
                </h2>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ud-muted)',
                  marginBottom: 4,
                }}>
                  {schema.id}
                </p>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--ud-muted)',
                }}>
                  v{schema.version} · {schema.license}
                </p>
              </div>
              <a
                href="https://github.com/saggarsonny-boop/universal-document/blob/main/spec/v0.1.0/ud.schema.json"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: 'var(--ud-teal)',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  fontWeight: 600,
                }}
              >
                View schema →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 40,
        padding: '20px 24px',
        background: 'var(--ud-paper-2)',
        border: '1px dashed var(--ud-border)',
        borderRadius: 'var(--ud-radius)',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--ud-muted)',
        lineHeight: 1.7,
      }}>
        Domain schemas (healthcare, finance, legal, government) will be listed here once published.
        Submit a Schema Creation Request to begin the registration process.
      </div>
    </div>
  )
}
