'use client'
import { useState, useCallback, useRef } from 'react'

type BlockType = 'heading' | 'paragraph' | 'list' | 'divider'

interface Block {
  id: string
  type: BlockType
  text: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function buildUDS(title: string, tags: string, blocks: Block[], expiresAt: string, requireAuth: boolean) {
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
  const udBlocks = blocks.map(b => {
    if (b.type === 'divider') return { id: b.id, type: 'divider', base_content: {} }
    if (b.type === 'list') {
      const items = b.text.split('\n').filter(Boolean)
      return { id: b.id, type: 'list', base_content: { items } }
    }
    return { id: b.id, type: b.type, base_content: { text: b.text } }
  })
  return {
    ud_version: 'iSDF v0.1.0',
    state: 'UDR',
    metadata: {
      id: uid(),
      title: title || 'Untitled',
      created_at: new Date().toISOString(),
      revoked: false,
      tags: tagList,
      ...(expiresAt ? { expires_at: new Date(expiresAt).toISOString() } : {}),
    },
    manifest: {
      base_language: 'en',
      language_manifest: [],
      clarity_layer_manifest: [],
      permissions: { require_auth: requireAuth },
    },
    blocks: udBlocks,
  }
}

const S = {
  page: { minHeight: '100vh', background: 'var(--bg)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' } as React.CSSProperties,
  wrap: { maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' } as React.CSSProperties,
  h1: { fontSize: '26px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' } as React.CSSProperties,
  sub: { fontSize: '14px', color: 'var(--muted)', marginBottom: '40px' } as React.CSSProperties,
  label: { display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none' } as React.CSSProperties,
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' } as React.CSSProperties,
  field: { marginBottom: '20px' } as React.CSSProperties,
  section: { fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '12px', marginTop: '32px' },
  block: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px', display: 'flex', gap: '0', overflow: 'hidden' } as React.CSSProperties,
  blockType: { padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' as const, gap: '4px', alignItems: 'center', justifyContent: 'center' },
  typeBtn: (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(212,175,55,0.15)' : 'none',
    border: active ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
    color: active ? 'var(--gold)' : 'var(--muted)',
    borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', fontSize: '10px', whiteSpace: 'nowrap' as const,
  }),
  textarea: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '14px', padding: '12px 14px', resize: 'none' as const, minHeight: '60px', fontFamily: 'inherit', lineHeight: '1.6' },
  delBtn: { background: 'none', border: 'none', color: 'rgba(239,68,68,0.4)', cursor: 'pointer', padding: '10px 10px', fontSize: '16px', alignSelf: 'center' as const, flexShrink: 0 },
  addRow: { display: 'flex', gap: '8px', marginTop: '4px' } as React.CSSProperties,
  addBtn: (type: BlockType): React.CSSProperties => ({ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }),
  exportBtn: { background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 28px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '32px' } as React.CSSProperties,
  check: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } as React.CSSProperties,
  checkLabel: { fontSize: '13px', color: 'var(--text)' } as React.CSSProperties,
}

export default function CreatorPage() {
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [requireAuth, setRequireAuth] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([{ id: uid(), type: 'paragraph', text: '' }])
  const [exported, setExported] = useState(false)

  const addBlock = (type: BlockType) => {
    setBlocks(bs => [...bs, { id: uid(), type, text: '' }])
  }

  const updateBlock = useCallback((id: string, field: keyof Block, value: string) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, [field]: value } : b))
  }, [])

  const deleteBlock = useCallback((id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id))
  }, [])

  const exportFile = () => {
    const doc = buildUDS(title, tags, blocks, expiresAt, requireAuth)
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'document').toLowerCase().replace(/\s+/g, '-')}.uds`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return (
    <div style={S.page}>
      <div style={S.wrap}>
        <h1 style={S.h1}>UD Creator</h1>
        <p style={S.sub}>Build a Universal Document (.uds) with metadata, expiry, and structured content.</p>

        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>Document title</label>
            <input style={S.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="My document" />
          </div>
          <div style={S.field}>
            <label style={S.label}>Tags (comma-separated)</label>
            <input style={S.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="legal, draft, private" />
          </div>
        </div>

        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>Expires at (optional)</label>
            <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </div>
          <div style={{ ...S.field, display: 'flex', alignItems: 'flex-end', paddingBottom: '2px' }}>
            <label style={S.check}>
              <input type="checkbox" checked={requireAuth} onChange={e => setRequireAuth(e.target.checked)} />
              <span style={S.checkLabel}>Require authentication to read</span>
            </label>
          </div>
        </div>

        <div style={S.section}>Content blocks</div>

        {blocks.map((block) => (
          <div key={block.id} style={S.block}>
            <div style={S.blockType}>
              {(['heading', 'paragraph', 'list', 'divider'] as BlockType[]).map(t => (
                <button key={t} style={S.typeBtn(block.type === t)} onClick={() => updateBlock(block.id, 'type', t)}>{t[0].toUpperCase()}</button>
              ))}
            </div>
            {block.type === 'divider' ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                <div style={{ height: '1px', background: 'var(--border)', flex: 1 }} />
              </div>
            ) : (
              <textarea
                style={{ ...S.textarea, fontSize: block.type === 'heading' ? '18px' : '14px', fontWeight: block.type === 'heading' ? 600 : 400 }}
                value={block.text}
                onChange={e => updateBlock(block.id, 'text', e.target.value)}
                placeholder={block.type === 'list' ? 'One item per line...' : block.type === 'heading' ? 'Heading...' : 'Write something...'}
                rows={block.type === 'heading' ? 1 : 3}
              />
            )}
            <button style={S.delBtn} onClick={() => deleteBlock(block.id)} title="Remove block">×</button>
          </div>
        ))}

        <div style={S.addRow}>
          {(['heading', 'paragraph', 'list', 'divider'] as BlockType[]).map(t => (
            <button key={t} style={S.addBtn(t)} onClick={() => addBlock(t)}>+ {t}</button>
          ))}
        </div>

        <button style={S.exportBtn} onClick={exportFile}>
          {exported ? '✓ Downloaded' : 'Export .uds file'}
        </button>
      </div>
    </div>
  )
}
