import Link from 'next/link'
import { extractHeadings, getGovernanceMarkdown } from '@/lib/registry/governance'
import MarkdownRenderer from '@/components/registry/MarkdownRenderer'
import { REGISTRY_PATHS } from '@/lib/registry/site'

export default function GovernancePage() {
  const markdown = getGovernanceMarkdown()
  const headings = extractHeadings(markdown).filter((h) => h.level <= 2)

  return (
    <div className="governance-layout" style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: '48px 24px 96px',
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: 48,
      alignItems: 'start',
    }}>
      <aside className="governance-sidebar" style={{
        position: 'sticky',
        top: 80,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
      }}>
        <div style={{
          color: 'var(--ud-gold)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 12,
          fontWeight: 600,
        }}>
          On this page
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {headings.map((h) => (
            <a
              key={h.id}
              href={`#${h.id}`}
              style={{
                color: 'var(--ud-muted)',
                textDecoration: 'none',
                paddingLeft: h.level === 2 ? 12 : 0,
                lineHeight: 1.4,
              }}
            >
              {h.text}
            </a>
          ))}
        </nav>
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--ud-border)' }}>
          <Link href={REGISTRY_PATHS.home} style={{ color: 'var(--ud-teal)', textDecoration: 'none', fontSize: 12 }}>
            ← Back to home
          </Link>
        </div>
      </aside>

      <article className="governance-content">
        <MarkdownRenderer content={markdown} />
      </article>

      <style>{`
        @media (max-width: 860px) {
          .governance-layout { grid-template-columns: 1fr !important; }
          .governance-sidebar { display: none; }
        }
      `}</style>
    </div>
  )
}
