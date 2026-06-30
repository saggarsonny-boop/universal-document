import Link from 'next/link'

const HIGHLIGHTS = [
  {
    title: 'Open by default',
    body: 'Public schemas are free under CC BY 4.0. Anyone with an account can submit a schema for review.',
    stat: 'CC BY 4.0',
  },
  {
    title: 'Formal review',
    body: 'Every schema passes impact analysis, harmonization, public consultation, and board approval before publication.',
    stat: '5-stage process',
  },
  {
    title: 'Versioned & notified',
    body: 'Semantic versioning with support for the latest two active versions. Subscribers get notified on every change.',
    stat: 'Semver',
  },
  {
    title: 'Commercial option',
    body: 'Register proprietary schemas for $99 per year per schema, with priority review and enhanced notifications.',
    stat: '$99/yr',
  },
]

const MATURITY = [
  { level: '0', name: 'Draft', desc: 'Work in progress. Open for public comment.' },
  { level: '1', name: 'Recommended', desc: 'Stable for production pilots. Board approved.' },
  { level: '2', name: 'Standard', desc: 'Normative reference for a domain. Highest maturity.' },
]

const DOMAINS = ['Healthcare', 'Finance', 'Legal', 'Government']

export default function HomePage() {
  return (
    <div>
      <section style={{
        padding: '72px 24px 56px',
        maxWidth: 900,
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--ud-gold)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          Universal Document Foundation
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          color: 'var(--ud-ink)',
          lineHeight: 1.1,
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}>
          Schema Registry
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 18,
          color: 'var(--ud-muted)',
          lineHeight: 1.7,
          maxWidth: 640,
          margin: '0 auto 32px',
        }}>
          The authoritative catalogue of JSON Schema definitions for Universal Document™ files —
          from core iSDF schemas to domain-specific document types for healthcare, finance, legal, and government.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/governance" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'var(--ud-gold)',
            color: '#1e2d3d',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 'var(--ud-radius)',
            textDecoration: 'none',
          }}>
            Read governance model →
          </Link>
          <Link href="/schemas" style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '12px 24px',
            background: 'transparent',
            color: 'var(--ud-ink)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 'var(--ud-radius)',
            border: '1px solid var(--ud-border)',
            textDecoration: 'none',
          }}>
            Browse schemas
          </Link>
        </div>
      </section>

      <section style={{
        padding: '0 24px 64px',
        maxWidth: 1000,
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}>
          {HIGHLIGHTS.map((item) => (
            <div key={item.title} style={{
              background: 'var(--ud-paper-2)',
              border: '1px solid var(--ud-border)',
              borderRadius: 'var(--ud-radius-lg)',
              padding: '24px 22px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--ud-gold)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                {item.stat}
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--ud-ink)',
                marginBottom: 10,
              }}>
                {item.title}
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 14,
                color: 'var(--ud-muted)',
                lineHeight: 1.6,
              }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{
        padding: '56px 24px',
        background: 'var(--ud-paper-2)',
        borderTop: '1px solid var(--ud-border)',
        borderBottom: '1px solid var(--ud-border)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--ud-ink)',
            marginBottom: 24,
            textAlign: 'center',
          }}>
            Maturity levels
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}>
            {MATURITY.map((m) => (
              <div key={m.level} style={{
                background: '#fff',
                border: '1px solid var(--ud-border)',
                borderRadius: 'var(--ud-radius)',
                padding: '20px 18px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'var(--ud-gold)',
                  marginBottom: 6,
                }}>
                  {m.level}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--ud-ink)',
                  marginBottom: 8,
                }}>
                  {m.name}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-muted)', lineHeight: 1.6 }}>
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '56px 24px 80px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--ud-ink)',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          Domain working groups
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 16,
          color: 'var(--ud-muted)',
          textAlign: 'center',
          marginBottom: 28,
          lineHeight: 1.7,
        }}>
          Schemas are reviewed by technical working groups before approval by the Schema Review Board.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {DOMAINS.map((domain) => (
            <span key={domain} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              padding: '8px 16px',
              background: 'var(--ud-paper-2)',
              border: '1px solid var(--ud-border)',
              borderRadius: 999,
              color: 'var(--ud-ink)',
            }}>
              {domain}
            </span>
          ))}
        </div>

        <div style={{
          marginTop: 48,
          padding: '24px 28px',
          background: 'var(--ud-paper-2)',
          border: '1px solid var(--ud-border)',
          borderRadius: 'var(--ud-radius-lg)',
          textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)', marginBottom: 16, lineHeight: 1.7 }}>
            Ready to submit a schema? Read the full governance model for the registration process,
            fee structure, PKI integration requirements, and crypto-agility policy.
          </p>
          <Link href="/governance" style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'var(--ud-teal)',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            View full governance document →
          </Link>
        </div>
      </section>
    </div>
  )
}
