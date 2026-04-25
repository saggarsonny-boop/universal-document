import fs from 'fs'
import path from 'path'
import React from 'react'

function renderMarkdown(md: string): React.ReactNode[] {
  const lines = md.split('\n')
  const nodes: React.ReactNode[] = []
  let key = 0

  const renderInline = (text: string): React.ReactNode => {
    // Bold **text** — if it looks like a URL, make it a link
    const parts = text.split(/\*\*(.+?)\*\*/g)
    return parts.map((p, i) => {
      if (i % 2 === 1) {
        // bold segment — if it contains a .hive.baby or .baby URL, link it
        const urlMatch = p.match(/^([\w.-]+\.(?:hive\.baby|baby)(?:\/[\w/-]*)?)$/)
        if (urlMatch) {
          return <a key={i} href={`https://${p}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ud-gold)', textDecoration: 'none', borderBottom: '1px solid rgba(200,150,10,0.3)' }}>{p}</a>
        }
        return <strong key={i}>{p}</strong>
      }
      // inline code `text`
      const codeParts = p.split(/`([^`]+)`/g)
      return codeParts.map((cp, ci) =>
        ci % 2 === 1
          ? <code key={ci} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em', background: 'rgba(200,150,10,0.08)', padding: '1px 4px', borderRadius: 3 }}>{cp}</code>
          : cp
      )
    })
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('# ')) {
      nodes.push(<h1 key={key++} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: 'var(--ud-ink)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>{line.slice(2)}</h1>)
    } else if (line.startsWith('### ')) {
      nodes.push(<h3 key={key++} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ud-gold)', marginBottom: 32, marginTop: 0 }}>{line.slice(4)}</h3>)
    } else if (line === '---') {
      nodes.push(<div key={key++} style={{ height: 1, background: 'var(--ud-border)', margin: '32px 0' }} />)
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      nodes.push(<p key={key++} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', letterSpacing: '0.05em', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--ud-border)' }}>{line.slice(1, -1)}</p>)
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      // Check if it's a tool line (**url** — description)
      const toolMatch = line.match(/^\*\*([\w.-]+\.(?:hive\.baby|baby)(?:\/[\w/-]*)?)\*\*\s*—\s*(.+)$/)
      if (toolMatch) {
        nodes.push(
          <div key={key++} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderLeft: '3px solid var(--ud-gold)', borderRadius: 'var(--ud-radius)', padding: '12px 16px', margin: '24px 0', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            <a href={`https://${toolMatch[1]}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ud-gold)', textDecoration: 'none', fontWeight: 700 }}>{toolMatch[1]}</a>
            <span style={{ color: 'var(--ud-muted)' }}> — {toolMatch[2]}</span>
          </div>
        )
      } else {
        nodes.push(<p key={key++} style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--ud-ink)', lineHeight: 1.8, marginBottom: 0 }}>{renderInline(line)}</p>)
      }
    }
    i++
  }
  return nodes
}

export function ScenarioPage({ file, backLabel, backHref }: { file: string; backLabel: string; backHref: string }) {
  const mdPath = path.join(process.cwd(), 'public', 'scenarios', file)
  const md = fs.readFileSync(mdPath, 'utf-8')

  return (
    <main style={{ padding: '64px 24px 96px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <a href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)', textDecoration: 'none', marginBottom: 48 }}>
        ← {backLabel}
      </a>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {renderMarkdown(md)}
      </div>
    </main>
  )
}
