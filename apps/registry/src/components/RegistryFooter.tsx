'use client'

const NAV_LINKS = [
  { label: 'Governance', href: '/governance' },
  { label: 'Schemas', href: '/schemas' },
  { label: 'Universal Document', href: 'https://universaldocument.org' },
  { label: 'Validator', href: 'https://validator.hive.baby' },
  { label: 'White Paper', href: 'https://universaldocument.org/whitepaper' },
]

export default function RegistryFooter() {
  return (
    <footer style={{
      borderTop: '0.5px solid var(--ud-border)',
      padding: '40px 24px 32px',
      background: 'var(--ud-paper-2)',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          {NAV_LINKS.map((t) => (
            <a key={t.href} href={t.href} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ud-muted)',
              textDecoration: 'none',
            }}>
              {t.label}
            </a>
          ))}
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 10 }}>
          <a href="mailto:registry@universaldocument.org" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>
            registry@universaldocument.org
          </a>
          {' · '}
          <a href="https://registry.universaldocument.org" style={{ color: 'var(--ud-muted)', textDecoration: 'none' }}>
            registry.universaldocument.org
          </a>
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-border-2)', marginBottom: 4 }}>
          Operated by the Universal Document Foundation · CC BY 4.0
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-border-2)' }}>
          © 2026 Universal Document Incorporated
        </p>
      </div>
    </footer>
  )
}
