'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const MAX_BYTES = 200 * 1024 * 1024

export default function VideoEmbed() {
  const [docFile, setDocFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [draggingD, setDraggingD] = useState(false)
  const [draggingV, setDraggingV] = useState(false)
  const [caption, setCaption] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const dRef = useRef<HTMLInputElement>(null)
  const vRef = useRef<HTMLInputElement>(null)

  const onDropD = useCallback((e: React.DragEvent) => { e.preventDefault(); setDraggingD(false); const f = e.dataTransfer.files[0]; if (f) { setDocFile(f); setResult(null) } }, [])
  const onDropV = useCallback((e: React.DragEvent) => { e.preventDefault(); setDraggingV(false); const f = e.dataTransfer.files[0]; if (f) { setVideoFile(f); setResult(null) } }, [])

  const run = async () => {
    if (!docFile || !videoFile) return
    if (videoFile.size > MAX_BYTES) { setError(`Video exceeds 200 MB limit (${(videoFile.size / 1024 / 1024).toFixed(0)} MB)`); return }
    setError(''); setResult(null); setProcessing(true)
    try {
      const docText = await docFile.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(docText) } catch { throw new Error('Document must be a valid .uds or .udr file.') }

      const arrayBuf = await videoFile.arrayBuffer()
      const bytes = new Uint8Array(arrayBuf)
      let b64 = ''; const CHUNK = 8192
      for (let i = 0; i < bytes.length; i += CHUNK) {
        b64 += btoa(String.fromCharCode(...bytes.subarray(i, i + CHUNK)))
      }
      const now = new Date().toISOString()
      const updated = {
        ...doc,
        media_objects: [
          ...((Array.isArray(doc.media_objects) ? doc.media_objects : []) as unknown[]),
          { type: 'video', filename: videoFile.name, mime_type: videoFile.type || 'video/mp4', size_bytes: videoFile.size, caption: caption || undefined, embedded_at: now, data_base64: b64 },
        ],
        provenance: { ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}), video_embedded_at: now },
      }
      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: docFile.name.replace(/\.(uds|udr)$/, '') + '-video.uds' })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
    finally { setProcessing(false) }
  }

  const ds = (active: boolean) => ({ border: `1.5px dashed ${active ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '24px 16px', textAlign: 'center' as const, cursor: 'pointer', background: active ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s' })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Video Embed</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Embed a video file directly into a Universal Document™. The video becomes a permanent content object — not a link. Supports .mp4 and .mov up to 200 MB. Encoding may take a moment for large files.
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
          <div style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Video file <span style={{ color: 'var(--ud-danger)' }}>*</span></div>
          <div style={ds(draggingV)} onDragOver={e => { e.preventDefault(); setDraggingV(true) }} onDragLeave={() => setDraggingV(false)} onDrop={onDropV} onClick={() => vRef.current?.click()}>
            <input ref={vRef} type="file" accept=".mp4,.mov,.webm" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setVideoFile(f); setResult(null) } }} />
            <div style={{ fontSize: 13, color: videoFile ? 'var(--ud-ink)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
              {videoFile ? `🎬 ${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(0)} MB)` : 'Drop .mp4 .mov · max 200 MB'}
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Caption (optional)</label>
        <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Site visit footage — Parcel 4B" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }} />
      </div>
      {processing && <div style={{ marginBottom: 16 }}><div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} /></div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Encoding video — this may take a moment…</div></div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Video embedded ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{videoFile?.name}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!docFile || !videoFile || processing} style={{ width: '100%', padding: '14px', background: !docFile || !videoFile || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !docFile || !videoFile || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !docFile || !videoFile || processing ? 'not-allowed' : 'pointer' }}>{processing ? 'Encoding…' : 'Embed Video'}</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. Video encoded as base64. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Video Embed differs from YouTube links and PDF video attachments</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>YouTube links go dead. PDF video attachments are stripped by email clients. UD Video Embed makes the video a permanent, inseparable part of the document.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'YouTube embed link in a document', body: 'Works while the video is live. The moment the channel is deleted, the video is made private, or YouTube changes embed policies, the document has a broken embed. No control, no permanence.' },
            { title: 'PDF video attachment', body: 'Acrobat Pro supports video annotations, but most PDF viewers strip them on open. Email gateways filter them as security risks. The video rarely survives document forwarding.' },
            { title: 'UD Video Embed — video encoded inside the document', body: 'The video is base64-encoded and written into the .uds file\'s metadata. No external hosting, no platform dependency. The video is as permanent as the text — it goes wherever the document goes.' },
            { title: 'UD Video Embed — playable in UD Reader', body: 'UD Reader renders embedded video inline in the document view. Recipients open the .uds and the video is there, ready to play — no separate player, no YouTube account, no internet connection required.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="video-embed" tips={tourSteps['video-embed']} />
    </div>
  )
}
