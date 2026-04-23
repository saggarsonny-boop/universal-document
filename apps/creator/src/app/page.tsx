'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import UDOnboarding from '@/components/UDOnboarding'

type BlockType = 'heading' | 'paragraph' | 'list' | 'divider'
type DocState = 'UDR' | 'UDS'
interface Block { id: string; type: BlockType; html: string }
interface SavedDoc { id: string; title: string; updated_at: string }

function uid() { return Math.random().toString(36).slice(2, 10) }

function getPlainText(html: string) {
  if (typeof document === 'undefined') return html
  const d = document.createElement('div')
  d.innerHTML = html
  return d.textContent ?? ''
}

function getIdentity(state: DocState) {
  if (state === 'UDS') {
    return {
      role: 'sealed' as const,
      watermark_tone: 'dark_blue' as const,
      watermark_hex: '#003A8C',
      icon: {
        desktop: '/icons/uds-file.svg',
        finder_preview: '/icons/uds-file.svg',
        explorer_preview: '/icons/uds-file.svg',
        preview_pane: '/icons/uds-file.svg',
      },
      file_metadata: {
        format_family: 'UD' as const,
        extension_hint: 'uds' as const,
      },
    }
  }

  return {
    role: 'editable' as const,
    watermark_tone: 'light_blue' as const,
    watermark_hex: '#4DA3FF',
    icon: {
      desktop: '/icons/udr-file.svg',
      finder_preview: '/icons/udr-file.svg',
      explorer_preview: '/icons/udr-file.svg',
      preview_pane: '/icons/udr-file.svg',
    },
    file_metadata: {
      format_family: 'UD' as const,
      extension_hint: 'udr' as const,
    },
  }
}

function hashContent(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return `udhash_${(h >>> 0).toString(16).padStart(8, '0')}`
}

function buildUDS(title: string, tags: string, blocks: Block[], expiresAt: string, requireAuth: boolean, state: DocState, selfDestruct = false, selfDestructViews = 1, audienceVersions: string[] = []) {
  const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
  const identity = getIdentity(state)
  const udBlocks = blocks.map(b => {
    if (b.type === 'divider') return { id: b.id, type: 'divider', base_content: {} }
    if (b.type === 'list') {
      const items = b.html.split('\n').filter(Boolean)
      return { id: b.id, type: 'list', base_content: { items } }
    }
    return {
      id: b.id, type: b.type,
      base_content: { html: b.html, text: getPlainText(b.html) },
    }
  })
  const chainHash = hashContent(JSON.stringify(udBlocks))
  return {
    ud_version: 'iSDF v0.1.0',
    state,
    metadata: {
      id: uid(),
      title: title || 'Untitled',
      created_at: new Date().toISOString(),
      revoked: false,
      tags: tagList,
      visual_identity: identity,
      viral_links: {
        open_in_reader: 'https://reader.hive.baby',
        convert_to_uds: 'https://converter.hive.baby',
        create_udr: 'https://creator.hive.baby',
      },
      ...(expiresAt ? { expires_at: new Date(expiresAt).toISOString() } : {}),
    },
    manifest: {
      base_language: 'en',
      language_manifest: [],
      clarity_layer_manifest: [],
      permissions: { require_auth: requireAuth },
      ...(selfDestruct ? { self_destruct: { enabled: true, after_views: selfDestructViews } } : {}),
      ...(audienceVersions.length > 0 ? { audience_versions: audienceVersions } : {}),
    },
    blocks: udBlocks,
    ...(state === 'UDS' ? {
      seal: {
        sealed_at: new Date().toISOString(),
        sealed_by: 'UD Creator/Editor',
        hash: chainHash,
        chain_of_custody: [
          { event: 'created', actor: 'UD Creator/Editor', timestamp: new Date().toISOString(), note: 'Document created in editor dashboard.' },
          { event: 'sealed', actor: 'UD Creator/Editor', timestamp: new Date().toISOString(), note: 'Exported as final UDS.' },
        ],
      },
    } : {}),
  }
}

// Rich text block — contenteditable, only syncs DOM→state to avoid cursor jump
function RichBlock({
  block, focused, onHtml, onFocus, onBlur, onDelete, onEnter,
}: {
  block: Block
  focused: boolean
  onHtml: (id: string, html: string) => void
  onFocus: (id: string) => void
  onBlur: () => void
  onDelete: (id: string) => void
  onEnter?: (id: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && !focused) {
      if (ref.current.innerHTML !== block.html) ref.current.innerHTML = block.html
    }
  }, [block.html, focused])

  const isHeading = block.type === 'heading'

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && onEnter) {
      e.preventDefault()
      onEnter(block.id)
    }
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => onFocus(block.id)}
      onBlur={e => { onHtml(block.id, e.currentTarget.innerHTML); onBlur() }}
      onInput={e => onHtml(block.id, (e.target as HTMLDivElement).innerHTML)}
      onKeyDown={handleKeyDown}
      data-placeholder={isHeading ? 'Heading…' : 'Write something…'}
      style={{
        flex: 1,
        outline: 'none',
        color: 'var(--text)',
        fontSize: isHeading ? '20px' : '15px',
        fontWeight: isHeading ? 700 : 400,
        lineHeight: '1.65',
        padding: '12px 14px',
        minHeight: isHeading ? '44px' : '60px',
        wordBreak: 'break-word',
      }}
    />
  )
}

function FormatToolbar({ onBold, onItalic, onLink, onUnlink }: {
  onBold: () => void; onItalic: () => void; onLink: () => void; onUnlink: () => void
}) {
  const btn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
    color: 'var(--text)', borderRadius: 5, padding: '3px 9px', cursor: 'pointer',
    fontSize: 13, lineHeight: 1.5,
  }
  return (
    <div style={{ display: 'flex', gap: 4, padding: '6px 8px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
      <button style={{ ...btn, fontWeight: 700 }} onMouseDown={e => { e.preventDefault(); onBold() }} title="Bold (Ctrl+B)">B</button>
      <button style={{ ...btn, fontStyle: 'italic' }} onMouseDown={e => { e.preventDefault(); onItalic() }} title="Italic (Ctrl+I)">I</button>
      <button style={btn} onMouseDown={e => { e.preventDefault(); onLink() }} title="Add link">⌘K</button>
      <button style={{ ...btn, fontSize: 11, color: 'var(--muted)' }} onMouseDown={e => { e.preventDefault(); onUnlink() }} title="Remove link">unlink</button>
    </div>
  )
}

function AuthModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function send() {
    setLoading(true); setErr('')
    let session = localStorage.getItem('ud_creator_session')
    if (!session) { session = uid() + uid(); localStorage.setItem('ud_creator_session', session) }
    try {
      const res = await fetch('/api/auth/send-magic-link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, session_id: session }),
      })
      const data = await res.json()
      if (!res.ok) { setErr(data.error || 'Failed'); return }
      setSent(true)
    } catch { setErr('Network error') } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '32px', width: '100%', maxWidth: 400, margin: '0 16px' }}>
        {!sent ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Save draft to account</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>Enter your email — we'll send a magic link. No password needed.</p>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && send()}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            {err && <p style={{ fontSize: 12, color: '#f87171', marginTop: 8 }}>{err}</p>}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={send} disabled={!email || loading}
                style={{ flex: 1, background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                {loading ? 'Sending…' : 'Send magic link'}
              </button>
              <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📬</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Check your email</h2>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>We sent a link to <strong style={{ color: 'var(--text)' }}>{email}</strong>. Click it to sign in and save your document.</p>
            <button onClick={onClose} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}>Close</button>
          </>
        )}
      </div>
    </div>
  )
}

function ProBadge() {
  return (
    <span style={{
      display: 'inline-block', background: 'var(--ud-gold-3)', color: 'var(--gold)',
      fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase' as const, padding: '2px 7px', borderRadius: 99, marginLeft: 6,
      border: '1px solid rgba(200,150,10,0.3)', verticalAlign: 'middle',
    }}>Pro</span>
  )
}

export default function CreatorPage() {
  const [started, setStarted] = useState(false)
  const [importDragging, setImportDragging] = useState(false)
  const importRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [requireAuth, setRequireAuth] = useState(false)
  const [blocks, setBlocks] = useState<Block[]>([{ id: uid(), type: 'paragraph', html: '' }])
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [exported, setExported] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [savedDocs, setSavedDocs] = useState<SavedDoc[]>([])
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [docId, setDocId] = useState<string | null>(null)
  const [docsOpen, setDocsOpen] = useState(false)
  const [docState, setDocState] = useState<DocState>('UDR')
  const [selfDestruct, setSelfDestruct] = useState(false)
  const [selfDestructViews, setSelfDestructViews] = useState<number>(1)
  const [audienceVersions, setAudienceVersions] = useState<string[]>([])
  const [customAudience, setCustomAudience] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleImport = useCallback(async (file: File) => {
    const name = file.name.replace(/\.[^.]+$/, '')
    setTitle(name)
    const text = await file.text().catch(() => '')
    if (text.trim()) {
      const lines = text.split('\n').filter(l => l.trim())
      setBlocks(lines.map(l => ({ id: uid(), type: 'paragraph' as BlockType, html: l })))
    }
    setStarted(true)
  }, [])

  useEffect(() => {
    const s = localStorage.getItem('ud_creator_session')
    const e = localStorage.getItem('ud_creator_email')
    if (s) setSessionId(s)
    if (e) setEmail(e)
  }, [])

  useEffect(() => {
    if (sessionId && email) fetchDocs()
  }, [sessionId, email]) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchDocs() {
    if (!sessionId) return
    try {
      const res = await fetch(`/api/documents?session_id=${sessionId}`)
      const data = await res.json()
      if (data.documents) setSavedDocs(data.documents)
    } catch { /* non-critical */ }
  }

  async function saveDoc() {
    if (!sessionId) { setShowAuth(true); return }
    setSaving(true); setSaveStatus('idle')
    const doc = buildUDS(title, tags, blocks, expiresAt, requireAuth, docState, selfDestruct, selfDestructViews, audienceVersions)
    try {
      if (docId) {
        await fetch(`/api/documents/${docId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, document: doc }),
        })
      } else {
        const res = await fetch('/api/documents', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, document: doc }),
        })
        const data = await res.json()
        if (data.id) setDocId(data.id)
      }
      setSaveStatus('saved')
      fetchDocs()
    } catch { setSaveStatus('error') }
    finally { setSaving(false); setTimeout(() => setSaveStatus('idle'), 2500) }
  }

  async function loadDoc(id: string) {
    if (!sessionId) return
    const res = await fetch(`/api/documents/${id}?session_id=${sessionId}`)
    const data = await res.json()
    const d = data.document
    if (!d) return
    setTitle(d.metadata?.title ?? '')
    setTags((d.metadata?.tags ?? []).join(', '))
    setExpiresAt(d.metadata?.expires_at ? d.metadata.expires_at.slice(0, 10) : '')
    setRequireAuth(d.manifest?.permissions?.require_auth ?? false)
    setDocState(d.state === 'UDS' ? 'UDS' : 'UDR')
    setBlocks((d.blocks ?? []).map((b: { id: string; type: BlockType; base_content: { html?: string; text?: string; items?: string[] } }) => ({
      id: b.id ?? uid(),
      type: b.type,
      html: b.base_content?.html ?? (b.base_content?.items ?? []).join('\n') ?? b.base_content?.text ?? '',
    })))
    setDocId(id)
    setDocsOpen(false)
  }

  async function deleteDoc(id: string) {
    if (!sessionId || !confirm('Delete this document?')) return
    await fetch(`/api/documents/${id}?session_id=${sessionId}`, { method: 'DELETE' })
    if (docId === id) { setDocId(null); resetEditor() }
    fetchDocs()
  }

  function resetEditor() {
    setTitle(''); setTags(''); setExpiresAt(''); setRequireAuth(false)
    setBlocks([{ id: uid(), type: 'paragraph', html: '' }])
    setDocState('UDR')
    setDocId(null)
    setSelfDestruct(false); setSelfDestructViews(1); setAudienceVersions([])
  }

  function signOut() {
    localStorage.removeItem('ud_creator_session')
    localStorage.removeItem('ud_creator_email')
    setSessionId(null); setEmail(null); setSavedDocs([])
  }

  const updateHtml = useCallback((id: string, html: string) => {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, html } : b))
  }, [])

  function updateType(id: string, type: BlockType) {
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, type } : b))
  }

  function addBlock(type: BlockType, afterId?: string) {
    const newBlock: Block = { id: uid(), type, html: '' }
    if (afterId) {
      setBlocks(bs => {
        const i = bs.findIndex(b => b.id === afterId)
        const next = [...bs]
        next.splice(i + 1, 0, newBlock)
        return next
      })
    } else {
      setBlocks(bs => [...bs, newBlock])
    }
    setTimeout(() => {
      const el = document.querySelector(`[data-blockid="${newBlock.id}"]`) as HTMLElement
      el?.focus()
    }, 50)
  }

  function deleteBlock(id: string) {
    setBlocks(bs => bs.length === 1 ? bs : bs.filter(b => b.id !== id))
  }

  function execFormat(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
  }

  function handleLink() {
    const url = window.prompt('Enter URL:', 'https://')
    if (url) execFormat('createLink', url)
  }

  function exportFile() {
    const doc = buildUDS(title, tags, blocks, expiresAt, requireAuth, docState, selfDestruct, selfDestructViews, audienceVersions)
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(title || 'document').toLowerCase().replace(/\s+/g, '-')}.${docState.toLowerCase()}`
    a.click()
    URL.revokeObjectURL(url)
    setExported(true)
    setTimeout(() => setExported(false), 2500)
  }

  const isRich = (type: BlockType) => type === 'paragraph' || type === 'heading'
  const focusedBlock = blocks.find(b => b.id === focusedId)
  const showToolbar = focusedId !== null && focusedBlock && isRich(focusedBlock.type) && focusedBlock.type === 'paragraph'

  const S = {
    page: { minHeight: '100vh', background: 'var(--bg)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' } as React.CSSProperties,
    wrap: { maxWidth: '760px', margin: '0 auto', padding: '48px 24px 80px' } as React.CSSProperties,
    topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap' as const, gap: 12 },
    h1: { fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' } as React.CSSProperties,
    label: { display: 'block', fontSize: '11px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
    input: { width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' } as React.CSSProperties,
    field: { marginBottom: '20px' } as React.CSSProperties,
    section: { fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '12px', marginTop: '32px' },
    blockWrap: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '8px', overflow: 'hidden' } as React.CSSProperties,
    blockInner: { display: 'flex', gap: 0 } as React.CSSProperties,
    blockType: { padding: '10px 10px', background: 'rgba(255,255,255,0.02)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' as const, gap: '4px', alignItems: 'center', justifyContent: 'center' },
    typeBtn: (active: boolean): React.CSSProperties => ({
      background: active ? 'rgba(212,175,55,0.15)' : 'none',
      border: active ? '1px solid rgba(212,175,55,0.3)' : '1px solid transparent',
      color: active ? 'var(--gold)' : 'var(--muted)',
      borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', fontSize: '10px', whiteSpace: 'nowrap',
    }),
    textarea: { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: '14px', padding: '12px 14px', resize: 'none' as const, minHeight: '60px', fontFamily: 'inherit', lineHeight: '1.6' },
    delBtn: { background: 'none', border: 'none', color: 'rgba(239,68,68,0.4)', cursor: 'pointer', padding: '10px 10px', fontSize: '16px', alignSelf: 'center' as const, flexShrink: 0 },
    addRow: { display: 'flex', gap: '8px', marginTop: '4px' } as React.CSSProperties,
    addBtn: { background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' } as React.CSSProperties,
    actionRow: { display: 'flex', gap: 10, marginTop: 32, flexWrap: 'wrap' as const },
    exportBtn: { background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' } as React.CSSProperties,
    saveBtn: (status: string): React.CSSProperties => ({
      background: status === 'saved' ? 'rgba(34,197,94,0.15)' : 'var(--surface)',
      color: status === 'saved' ? '#4ade80' : 'var(--text)',
      border: `1px solid ${status === 'saved' ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
      borderRadius: '8px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    }),
  }

  return (
    <div style={S.page}>
      <UDOnboarding engine="Creator" />
      {showAuth && <AuthModal onDone={() => { setShowAuth(false); fetchDocs() }} onClose={() => setShowAuth(false)} />}
      <div style={S.wrap}>

        {!started && (
          <div style={{ maxWidth: 680, margin: '0 auto', paddingTop: 32 }}>
            <h1 style={{ ...S.h1, textAlign: 'center', marginBottom: 8 }}>UD Creator</h1>
            <p style={{ textAlign: 'center', fontSize: 15, color: 'var(--muted)', marginBottom: 36 }}>Turn any file into a Universal Document™, or start fresh.</p>
            <input ref={importRef} type="file" accept=".docx,.xlsx,.csv,.pdf,.txt,.md,.png,.jpg,.jpeg,.pptx" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }} />
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16, alignItems: 'stretch' }}>
              <div
                onDragOver={e => { e.preventDefault(); setImportDragging(true) }}
                onDragLeave={() => setImportDragging(false)}
                onDrop={e => { e.preventDefault(); setImportDragging(false); const f = e.dataTransfer.files[0]; if (f) handleImport(f) }}
                onClick={() => importRef.current?.click()}
                style={{ border: `2px dashed ${importDragging ? 'var(--gold)' : 'rgba(200,150,10,0.4)'}`, background: importDragging ? 'rgba(200,150,10,0.06)' : 'var(--surface)', borderRadius: 14, padding: '32px 24px', cursor: 'pointer', transition: 'all 0.2s' }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>📂</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Import a file</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 14 }}>Turn any existing document into a Universal Document™</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>.docx · .xlsx · .csv · .pdf · .txt · .md · .png · .jpg · .pptx</div>
                <div style={{ marginTop: 16, fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Drag file here or click to browse →</div>
              </div>
              <div
                onClick={() => setStarted(true)}
                style={{ border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 14, padding: '32px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'border-color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>✦</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Start from scratch</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 20 }}>Plain text and headings only</div>
                <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 600 }}>Start blank →</div>
              </div>
            </div>
          </div>
        )}

        {started && (<><div style={S.topBar}>
          <h1 style={S.h1}>UD Creator / UD Editor</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {email ? (
              <>
                <button onClick={() => { setDocsOpen(o => !o); fetchDocs() }}
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
                  My docs {savedDocs.length > 0 ? `(${savedDocs.length})` : ''}
                </button>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{email}</span>
                <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 12, cursor: 'pointer' }}>Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)}
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
                Sign in to save →
              </button>
            )}
          </div>
        </div>


        {docsOpen && savedDocs.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Saved documents</span>
              <button onClick={() => { resetEditor(); setDocsOpen(false) }}
                style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                + New document
              </button>
            </div>
            {savedDocs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                <div>
                  <button onClick={() => loadDoc(doc.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text)', fontSize: 14, cursor: 'pointer', padding: 0, textAlign: 'left', fontWeight: 500 }}>
                    {doc.title || 'Untitled'}
                  </button>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </div>
                </div>
                <button onClick={() => deleteDoc(doc.id)}
                  style={{ background: 'none', border: 'none', color: 'rgba(239,68,68,0.5)', cursor: 'pointer', fontSize: 13, padding: '4px 8px' }}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

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

        <div style={{ ...S.field, marginBottom: 18 }}>
          <label style={S.label}>Document type</label>
          <div style={{ display: 'inline-flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setDocState('UDR')}
              style={{
                padding: '8px 14px',
                border: 'none',
                cursor: 'pointer',
                background: docState === 'UDR' ? 'rgba(96,165,250,0.18)' : 'transparent',
                color: docState === 'UDR' ? '#93c5fd' : 'var(--muted)',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              UDR editable
            </button>
            <button
              onClick={() => setDocState('UDS')}
              style={{
                padding: '8px 14px',
                border: 'none',
                cursor: 'pointer',
                background: docState === 'UDS' ? 'rgba(37,99,235,0.18)' : 'transparent',
                color: docState === 'UDS' ? '#60a5fa' : 'var(--muted)',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              UDS sealed
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            {docState === 'UDS' ? 'Sealed document — immutable once exported.' : 'Revisable draft — can be edited after export.'}
          </p>
        </div>


        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label}>When should this expire?</label>
            <input style={{ ...S.input, colorScheme: 'dark' }} type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Leave blank for no expiry</div>
          </div>
          <div style={{ ...S.field, display: 'flex', flexDirection: 'column' as const, justifyContent: 'flex-start', gap: 6 }}>
            <label style={S.label}>Who can read this?</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={requireAuth} onChange={e => setRequireAuth(e.target.checked)} />
              <span style={{ fontSize: 13, color: 'var(--text)' }}>Require authentication</span>
            </label>
            {requireAuth && <div style={{ fontSize: 11, color: 'var(--muted)' }}>Reader must sign in with a magic link.</div>}
          </div>
        </div>

        {/* ── Pro Features ─────────────────────────────── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 14 }}>
            Pro features <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', background: 'rgba(200,150,10,0.1)', padding: '1px 6px', borderRadius: 99 }}>free during beta</span>
          </div>

          {/* Self-Destruct */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center' }}>
                Self-destruct after reading?<ProBadge />
              </div>
              <button
                onClick={() => setSelfDestruct(v => !v)}
                style={{
                  width: 40, height: 22, borderRadius: 11,
                  background: selfDestruct ? 'var(--gold)' : 'var(--border)',
                  border: 'none', cursor: 'pointer', position: 'relative' as const,
                  flexShrink: 0, transition: 'background 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute' as const, top: 3,
                  left: selfDestruct ? 20 : 3,
                  width: 16, height: 16, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
              Document permanently invalidates itself after the set number of reads. Cannot be recovered.
            </div>
            {selfDestruct && (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Delete after how many views?</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
                  {[1, 3, 10].map(n => (
                    <button key={n} onClick={() => { setSelfDestructViews(n); setShowCustomInput(false) }}
                      style={{
                        background: selfDestructViews === n && !showCustomInput ? 'var(--gold)' : 'var(--surface)',
                        color: selfDestructViews === n && !showCustomInput ? '#fff' : 'var(--text)',
                        border: `1px solid ${selfDestructViews === n && !showCustomInput ? 'var(--gold)' : 'var(--border)'}`,
                        borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer',
                      }}>{n} view{n !== 1 ? 's' : ''}</button>
                  ))}
                  <button onClick={() => setShowCustomInput(v => !v)}
                    style={{
                      background: showCustomInput ? 'var(--gold)' : 'var(--surface)',
                      color: showCustomInput ? '#fff' : 'var(--text)',
                      border: `1px solid ${showCustomInput ? 'var(--gold)' : 'var(--border)'}`,
                      borderRadius: 6, padding: '5px 12px', fontSize: 13, cursor: 'pointer',
                    }}>Custom</button>
                </div>
                {showCustomInput && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="number" min={1} placeholder="e.g. 25"
                      style={{ ...S.input, width: 100 }}
                      onChange={e => { const v = parseInt(e.target.value); if (v > 0) setSelfDestructViews(v) }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>views</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '2px 0 16px' }} />

          {/* Audience Rewrite */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6, display: 'flex', alignItems: 'center' }}>
              Audience versions<ProBadge />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
              Generate the same content rewritten for different audiences. Each version is embedded in the same file and gets its own tab in the Reader.
            </div>
            {audienceVersions.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const, marginBottom: 10 }}>
                {audienceVersions.map(a => (
                  <span key={a} style={{
                    background: 'rgba(200,150,10,0.1)', color: 'var(--gold)',
                    border: '1px solid rgba(200,150,10,0.25)', borderRadius: 99,
                    padding: '3px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {a}
                    <button onClick={() => setAudienceVersions(vs => vs.filter(v => v !== a))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: 14, padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
            <select
              value=""
              onChange={e => {
                const val = e.target.value
                if (val === '__custom__') { setShowCustomInput(false); return }
                if (val && !audienceVersions.includes(val)) setAudienceVersions(vs => [...vs, val])
                e.target.value = ''
              }}
              style={{ ...S.input, cursor: 'pointer' }}
            >
              <option value="" disabled>+ Add audience version</option>
              {['Child (age 8–10)', 'Child (age 11–14)', 'Plain English (adult)', 'Clinical / Medical', 'Legal', 'Technical / Developer', 'Executive summary'].filter(a => !audienceVersions.includes(a)).map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
              <option value="__custom__">Custom audience…</option>
            </select>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <input
                placeholder="Custom audience (e.g. Teenager)"
                value={customAudience}
                onChange={e => setCustomAudience(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customAudience.trim() && !audienceVersions.includes(customAudience.trim())) {
                    setAudienceVersions(vs => [...vs, customAudience.trim()])
                    setCustomAudience('')
                  }
                }}
                style={{ ...S.input, fontSize: 13 }}
              />
              <button
                onClick={() => {
                  if (customAudience.trim() && !audienceVersions.includes(customAudience.trim())) {
                    setAudienceVersions(vs => [...vs, customAudience.trim()])
                    setCustomAudience('')
                  }
                }}
                style={{ background: 'var(--gold)', color: '#fff', border: 'none', borderRadius: 6, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const }}
              >Add</button>
            </div>
            {audienceVersions.length > 0 && (
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                Claude rewrites content for each audience automatically on export.
              </div>
            )}
          </div>
        </div>

        <div style={{ ...S.section, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span>Document content</span>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 400, letterSpacing: 0 }}>H = Heading · P = Paragraph · L = List · D = Divider</span>
        </div>

        {blocks.map(block => (
          <div key={block.id} style={S.blockWrap}>
            {showToolbar && focusedId === block.id && (
              <FormatToolbar
                onBold={() => execFormat('bold')}
                onItalic={() => execFormat('italic')}
                onLink={handleLink}
                onUnlink={() => execFormat('unlink')}
              />
            )}
            <div style={S.blockInner}>
              <div style={S.blockType}>
                {(['heading', 'paragraph', 'list', 'divider'] as BlockType[]).map(t => (
                  <button key={t} style={S.typeBtn(block.type === t)} onClick={() => updateType(block.id, t)}>
                    {t[0].toUpperCase()}
                  </button>
                ))}
              </div>

              {block.type === 'divider' ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px' }}>
                  <div style={{ height: '1px', background: 'var(--border)', flex: 1 }} />
                </div>
              ) : block.type === 'list' ? (
                <textarea
                  style={S.textarea}
                  value={block.html}
                  onChange={e => updateHtml(block.id, e.target.value)}
                  placeholder="One item per line…"
                  rows={3}
                />
              ) : (
                <RichBlock
                  block={block}
                  focused={focusedId === block.id}
                  onHtml={updateHtml}
                  onFocus={setFocusedId}
                  onBlur={() => setFocusedId(null)}
                  onDelete={deleteBlock}
                  onEnter={id => addBlock('paragraph', id)}
                />
              )}

              <button style={S.delBtn} onClick={() => deleteBlock(block.id)} title="Remove block">×</button>
            </div>
          </div>
        ))}

        <div style={S.addRow}>
          {(['heading', 'paragraph', 'list', 'divider'] as BlockType[]).map(t => (
            <button key={t} style={S.addBtn} onClick={() => addBlock(t)}>+ {t}</button>
          ))}
        </div>

        <div style={S.actionRow}>
          <button style={S.exportBtn} onClick={exportFile}>
            {exported ? '✓ Downloaded' : `Export .${docState.toLowerCase()} file`}
          </button>
          <button style={S.saveBtn(saveStatus)} onClick={saveDoc} disabled={saving}>
            {saving ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Save failed' : docId ? 'Save changes' : 'Save draft to account'}
          </button>
        </div>
        {exported && (
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <a href="https://reader.hive.baby" style={{
              background: 'var(--ud-ink)', color: '#fff', borderRadius: 99,
              padding: '9px 20px', fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}>Open in UD Reader →</a>
            <a href="https://validator.hive.baby" style={{
              background: 'transparent', color: 'var(--ud-ink)',
              border: '1px solid var(--ud-border)', borderRadius: 99,
              padding: '9px 20px', fontSize: 13, fontWeight: 500, textDecoration: 'none',
            }}>Validate this file →</a>
          </div>
        )}


        <style>{`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: var(--muted);
            pointer-events: none;
          }
        `}</style></>)}
      </div>
    </div>
  )
}
