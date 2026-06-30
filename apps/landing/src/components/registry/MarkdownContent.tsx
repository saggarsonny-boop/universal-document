import type { Components } from 'react-markdown'

function slugify(text: string): string {
  return text
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
}

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(28px, 4vw, 40px)',
      fontWeight: 700,
      color: 'var(--ud-ink)',
      margin: '48px 0 20px',
      lineHeight: 1.15,
      letterSpacing: '-0.02em',
    }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => {
    const id = slugify(String(children))
    return (
      <h2 id={id} style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(22px, 3vw, 28px)',
        fontWeight: 700,
        color: 'var(--ud-ink)',
        margin: '40px 0 16px',
        lineHeight: 1.2,
        scrollMarginTop: 80,
      }}>
        {children}
      </h2>
    )
  },
  h3: ({ children }) => {
    const id = slugify(String(children))
    return (
      <h3 id={id} style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        fontWeight: 600,
        color: 'var(--ud-ink-2)',
        margin: '28px 0 12px',
        scrollMarginTop: 80,
      }}>
        {children}
      </h3>
    )
  },
  p: ({ children }) => (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: 16,
      color: 'var(--ud-ink)',
      lineHeight: 1.75,
      marginBottom: 16,
    }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{
      fontFamily: 'var(--font-body)',
      fontSize: 16,
      color: 'var(--ud-ink)',
      lineHeight: 1.75,
      marginBottom: 16,
      paddingLeft: 24,
    }}>
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol style={{
      fontFamily: 'var(--font-body)',
      fontSize: 16,
      color: 'var(--ud-ink)',
      lineHeight: 1.75,
      marginBottom: 16,
      paddingLeft: 24,
    }}>
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li style={{ marginBottom: 6 }}>{children}</li>
  ),
  a: ({ href, children }) => (
    <a href={href} style={{ color: 'var(--ud-teal)', textDecoration: 'underline', textUnderlineOffset: 2 }}>
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <pre style={{
          background: 'var(--ud-paper-2)',
          border: '1px solid var(--ud-border)',
          borderRadius: 'var(--ud-radius)',
          padding: '16px 18px',
          overflowX: 'auto',
          marginBottom: 20,
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          lineHeight: 1.6,
        }}>
          <code>{children}</code>
        </pre>
      )
    }
    return (
      <code style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9em',
        background: 'var(--ud-paper-2)',
        border: '1px solid var(--ud-border)',
        borderRadius: 4,
        padding: '1px 6px',
      }}>
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', marginBottom: 24 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
      }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead style={{ background: 'var(--ud-paper-2)' }}>{children}</thead>
  ),
  th: ({ children }) => (
    <th style={{
      textAlign: 'left',
      padding: '10px 12px',
      borderBottom: '2px solid var(--ud-border)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--ud-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{
      padding: '10px 12px',
      borderBottom: '1px solid var(--ud-border)',
      verticalAlign: 'top',
      lineHeight: 1.5,
    }}>
      {children}
    </td>
  ),
  hr: () => (
    <hr style={{
      border: 'none',
      height: 1,
      background: 'var(--ud-gold)',
      opacity: 0.35,
      margin: '36px 0',
    }} />
  ),
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: '3px solid var(--ud-gold)',
      paddingLeft: 16,
      margin: '0 0 20px',
      color: 'var(--ud-muted)',
      fontStyle: 'italic',
    }}>
      {children}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong style={{ fontWeight: 600, color: 'var(--ud-ink)' }}>{children}</strong>
  ),
}
