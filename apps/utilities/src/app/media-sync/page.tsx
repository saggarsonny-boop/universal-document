'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface SyncPoint { timestamp: string; text_preview: string; section_index: number }
interface SyncResult { sync_points: SyncPoint[]; total_duration_estimate: string; sync_method: string }

export default function MediaSync() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [duration, setDuration] = useState('')
  const [processing, setProcessing] = useState(false)
  const [sync, setSync] = useState<SyncResult | null>(null)
  const [udsBlob, setUdsBlob] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setSync(null); setError(''); setUdsBlob(null) }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file) return
    setProcessing(true); setError(''); setSync(null); setUdsBlob(null)
    try {
      const form = new FormData(); form.append('file', file); if (duration) form.append('duration', duration)
      const res = await fetch('/api/media-sync', { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Sync failed') }
      const data = await res.json()
      setSync(data.sync)
      if (data.uds) {
        const blob = new Blob([data.uds], { type: 'application/json' })
        setUdsBlob({ url: URL.createObjectURL(blob), name: data.filename })
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Sync failed') }
    finally { setProcessing(false) }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Media Sync</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro · AI</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Claude maps your document text to estimated media timestamps — aligning paragraphs and sections to the audio or video timeline. Sync data embedded as a Clarity Layer.
      </p>
      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 20 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🎞 {file.name}<br /><span style={{ fontSize: 12, color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <div><div style={{ fontSize: 32, marginBottom: 10 }}>🎞</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop your .uds file</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>Document must contain text content</div></div>}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Media duration (optional)</label>
        <input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45:30 or 1:22:00" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }} />
      </div>
      {processing && <div style={{ marginBottom: 16 }}><div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: '60%', background: 'var(--ud-teal)', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} /></div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Aligning text with media timeline…</div></div>}
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {sync && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 14 }}>{sync.sync_points.length} sync points · Est. duration: {sync.total_duration_estimate}</div>
          <div style={{ border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
            {sync.sync_points.map((pt, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 16px', borderBottom: i < sync.sync_points.length - 1 ? '1px solid var(--ud-border)' : 'none', background: i % 2 === 0 ? '#fff' : 'var(--ud-paper-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-teal)', minWidth: 48, fontWeight: 600 }}>{pt.timestamp}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)' }}>{pt.text_preview}</span>
              </div>
            ))}
          </div>
          {udsBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Sync data embedded ✓</div>
              <a href={udsBlob.url} download={udsBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}
      <button onClick={run} disabled={!file || processing} style={{ width: '100%', padding: '14px', background: !file || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || processing ? 'not-allowed' : 'pointer' }}>{processing ? 'Syncing…' : 'Generate Media Sync'}</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Analysis powered by Claude claude-opus-4-5. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Media Sync differs from manual timestamping and transcription tools</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Manual timestamp tables become outdated when the media is re-edited. Transcription tools go one direction. UD Media Sync creates bidirectional alignment between document and media.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Manual timestamp table in a Word document', body: 'A separate document listing paragraph → timestamp mappings. Becomes stale the moment the media is re-edited. No machine-readable structure, no bidirectional navigation, no way to click a paragraph and jump to that moment.' },
            { title: 'Otter.ai / Descript transcription', body: 'Transcription tools go one direction — audio → text. They don\'t align an existing document (notes, report, research) with media. You get a new transcript, not alignment with what you already wrote.' },
            { title: 'UD Media Sync — AI-generated sync points', body: 'Claude estimates timestamps based on content density and typical speech rate (~140 wpm). Each section of the document is mapped to a media timestamp and the mapping is embedded in the .uds metadata.' },
            { title: 'UD Media Sync — sync points travel with the document', body: 'The timestamp alignment is part of the document itself — not a separate file or database. Any UD Reader implementation can use the sync metadata to enable paragraph-click-to-seek functionality.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="media-sync" tips={tourSteps['media-sync']} />
    </div>
  )
}
