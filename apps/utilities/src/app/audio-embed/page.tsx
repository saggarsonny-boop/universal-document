'use client'
import { useState, useRef, useCallback } from 'react'

const MAX_BYTES = 50 * 1024 * 1024

export default function AudioEmbed() {
  const [docFile, setDocFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [draggingD, setDraggingD] = useState(false)
  const [draggingA, setDraggingA] = useState(false)
  const [caption, setCaption] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const dRef = useRef<HTMLInputElement>(null)
  const aRef = useRef<HTMLInputElement>(null)

  const onDropD = useCallback((e: React.DragEvent) => { e.preventDefault(); setDraggingD(false); const f = e.dataTransfer.files[0]; if (f) { setDocFile(f); setResult(null) } }, [])
  const onDropA = useCallback((e: React.DragEvent) => { e.preventDefault(); setDraggingA(false); const f = e.dataTransfer.files[0]; if (f) { setAudioFile(f); setResult(null) } }, [])

  const run = async () => {
    if (!docFile || !audioFile) return
    if (audioFile.size > MAX_BYTES) { setError(`Audio file exceeds 50 MB limit (${(audioFile.size / 1024 / 1024).toFixed(1)} MB)`); return }
    setError(''); setResult(null)
    try {
      const docText = await docFile.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(docText) } catch { throw new Error('Document must be a valid .uds or .udr file.') }

      const arrayBuf = await audioFile.arrayBuffer()
      const b64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuf)))
      const now = new Date().toISOString()
      const updated = {
        ...doc,
        media_objects: [
          ...((Array.isArray(doc.media_objects) ? doc.media_objects : []) as unknown[]),
          { type: 'audio', filename: audioFile.name, mime_type: audioFile.type || 'audio/mpeg', size_bytes: audioFile.size, caption: caption || undefined, embedded_at: now, data_base64: b64 },
        ],
        provenance: { ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}), audio_embedded_at: now },
      }
      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: docFile.name.replace(/\.(uds|udr)$/, '') + '-audio.uds' })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  const ds = (active: boolean) => ({ border: `1.5px dashed ${active ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px 16px', textAlign: 'center' as const, cursor: 'pointer', background: active ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s' })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Audio Embed</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Embed an audio file directly into a Universal Document™ as a content object. The audio travels with the document — no external links, no missing files. Max 50 MB.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Document <span style={{ color: 'var(--ud-danger)' }}>*</span></div>
          <div style={ds(draggingD)} onDragOver={e => { e.preventDefault(); setDraggingD(true) }} onDragLeave={() => setDraggingD(false)} onDrop={onDropD} onClick={() => dRef.current?.click()}>
            <input ref={dRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setDocFile(f); setResult(null) } }} />
            <div style={{ fontSize: 13, color: docFile ? 'var(--ud-ink)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>{docFile ? `📄 ${docFile.name}` : 'Drop .uds file'}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Audio file <span style={{ color: 'var(--ud-danger)' }}>*</span></div>
          <div style={ds(draggingA)} onDragOver={e => { e.preventDefault(); setDraggingA(true) }} onDragLeave={() => setDraggingA(false)} onDrop={onDropA} onClick={() => aRef.current?.click()}>
            <input ref={aRef} type="file" accept=".mp3,.wav,.m4a,.aac,.ogg" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setAudioFile(f); setResult(null) } }} />
            <div style={{ fontSize: 13, color: audioFile ? 'var(--ud-ink)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
              {audioFile ? `🎵 ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(1)} MB)` : 'Drop .mp3 .wav .m4a'}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Caption (optional)</label>
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Interview recording — 12 April 2026" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }} />
      </div>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Audio embedded ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{audioFile?.name}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!docFile || !audioFile} style={{ width: '100%', padding: '14px', background: !docFile || !audioFile ? 'var(--ud-border)' : 'var(--ud-ink)', color: !docFile || !audioFile ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !docFile || !audioFile ? 'not-allowed' : 'pointer' }}>Embed Audio</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. Audio encoded as base64. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Audio Embed differs from PDF attachments and cloud audio links</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDFs can attach files, but attachments are stripped by email clients and cloud storage. Cloud audio links break when the hosting service changes. UD Audio Embed makes the audio inseparable from the document.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF with audio attachment', body: 'Acrobat Pro can attach files to PDFs, but most email clients strip attachments on PDF forwarding, and cloud storage often ignores embedded attachments. The audio is the first thing to get lost.' },
            { title: 'Hyperlink to cloud audio (SoundCloud, Google Drive)', body: 'The link works until the hosting service changes permissions, the account is deleted, or the file is moved. A document created today may have broken audio in two years.' },
            { title: 'UD Audio Embed — audio encoded inside the document', body: 'The audio is base64-encoded and written directly into the .uds file\'s metadata. There is no separate file, no external link, no hosting dependency. The audio is as permanent as the document itself.' },
            { title: 'UD Audio Embed — playable in UD Reader', body: 'UD Reader surfaces embedded audio as a playback element directly in the document view. Recipients don\'t need a separate audio player — open the .uds and the audio is there.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
