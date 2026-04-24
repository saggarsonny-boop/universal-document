'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface ChapterMarker { id: number; timestamp: string; title: string; linkedSection: string }
interface Chapter { chapter_number: number; title: string; timestamp: string; document_section: string; synopsis?: string }
interface SyncPoint { timestamp: string; text_preview: string; section_index: number }
interface SyncResult { sync_points: SyncPoint[]; chapters: Chapter[]; total_duration_estimate: string; sync_method: string }

export default function MediaSyncAdvanced() {
  const [docFile, setDocFile] = useState<File | null>(null)
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [docDragging, setDocDragging] = useState(false)
  const [mediaDragging, setMediaDragging] = useState(false)
  const [markers, setMarkers] = useState<ChapterMarker[]>([])
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const [udsBlob, setUdsBlob] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const docRef = useRef<HTMLInputElement>(null)
  const mediaRef = useRef<HTMLInputElement>(null)

  const onDocDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDocDragging(false); const f = e.dataTransfer.files[0]; if (f) { setDocFile(f); setResult(null); setError(''); setUdsBlob(null) } }, [])
  const onMediaDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setMediaDragging(false); const f = e.dataTransfer.files[0]; if (f) setMediaFile(f) }, [])

  function addMarker() { setMarkers(prev => [...prev, { id: Date.now(), timestamp: '', title: '', linkedSection: '' }]) }
  function removeMarker(id: number) { setMarkers(prev => prev.filter(m => m.id !== id)) }
  function updateMarker(id: number, field: keyof ChapterMarker, value: string) { setMarkers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m)) }

  const run = async () => {
    if (!docFile) return
    setProcessing(true); setError(''); setResult(null); setUdsBlob(null)
    try {
      const form = new FormData()
      form.append('document', docFile)
      if (mediaFile) form.append('media', mediaFile)
      if (markers.length > 0) {
        form.append('chapters', JSON.stringify(markers.map(m => ({ timestamp: m.timestamp, title: m.title, linked_section: m.linkedSection || undefined }))))
      }
      const res = await fetch('/api/media-sync-advanced', { method: 'POST', body: form })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Sync failed') }
      const data = await res.json()
      setResult(data.sync)
      if (data.uds) {
        const blob = new Blob([data.uds], { type: 'application/json' })
        setUdsBlob({ url: URL.createObjectURL(blob), name: data.filename })
      }
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Sync failed') }
    finally { setProcessing(false) }
  }

  const inp: React.CSSProperties = { width: '100%', padding: '9px 12px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }
  const dropBase = (active: boolean): React.CSSProperties => ({ border: `1.5px dashed ${active ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: active ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s' })

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Media Sync Advanced</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'rgba(124,58,237,0.1)', color: '#7c3aed', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Premium</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 12, lineHeight: 1.6 }}>
        Bidirectional document–media synchronization with chapter markers. Claude analyzes your document structure and aligns every section with a media timestamp — so clicking any paragraph jumps to that moment in the audio or video, and each chapter marker navigates both directions simultaneously.
      </p>
      <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6, padding: '12px 16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
        Useful for lecture notes sync, legal transcript sync, podcast chapter navigation, and any multimedia document where readers need to move between text and media. No other document format supports bidirectional media synchronization.
      </div>

      {/* Two upload zones */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div>
          <label style={{ ...lbl, marginBottom: 8 }}>Document (.uds) *</label>
          <div style={dropBase(docDragging)} onDragOver={e => { e.preventDefault(); setDocDragging(true) }} onDragLeave={() => setDocDragging(false)} onDrop={onDocDrop} onClick={() => docRef.current?.click()}>
            <input ref={docRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) { setDocFile(f); setResult(null); setError(''); setUdsBlob(null) } }} />
            {docFile ? <div style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📄 {docFile.name.slice(0, 28)}</div>
              : <div><div style={{ fontSize: 24, marginBottom: 8 }}>📄</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop .uds file</div></div>}
          </div>
        </div>
        <div>
          <label style={{ ...lbl, marginBottom: 8 }}>Audio / Video (optional)</label>
          <div style={dropBase(mediaDragging)} onDragOver={e => { e.preventDefault(); setMediaDragging(true) }} onDragLeave={() => setMediaDragging(false)} onDrop={onMediaDrop} onClick={() => mediaRef.current?.click()}>
            <input ref={mediaRef} type="file" accept=".mp3,.wav,.m4a,.mp4,.mov,audio/*,video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setMediaFile(f) }} />
            {mediaFile ? <div style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🎞 {mediaFile.name.slice(0, 28)}<div style={{ fontSize: 13, color: 'var(--ud-muted)', marginTop: 4 }}>{(mediaFile.size / 1024 / 1024).toFixed(1)} MB</div></div>
              : <div><div style={{ fontSize: 24, marginBottom: 8 }}>🎞</div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop media file</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>mp3 · wav · m4a · mp4 · mov · 500 MB max</div></div>}
          </div>
        </div>
      </div>

      {/* Chapter markers */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <label style={{ ...lbl, marginBottom: 0 }}>Chapter markers (optional — auto-generated if omitted)</label>
          <button onClick={addMarker} style={{ background: 'none', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '4px 12px', fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', cursor: 'pointer' }}>+ Add marker</button>
        </div>
        {markers.map((m, idx) => (
          <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto', gap: 10, alignItems: 'flex-end', marginBottom: 8 }}>
            <div><label style={lbl}>Timestamp</label><input style={inp} value={m.timestamp} onChange={e => updateMarker(m.id, 'timestamp', e.target.value)} placeholder="MM:SS" /></div>
            <div><label style={lbl}>Chapter title</label><input style={inp} value={m.title} onChange={e => updateMarker(m.id, 'title', e.target.value)} placeholder={`Chapter ${idx + 1}`} /></div>
            <div><label style={lbl}>Linked section</label><input style={inp} value={m.linkedSection} onChange={e => updateMarker(m.id, 'linkedSection', e.target.value)} placeholder="Heading or section name" /></div>
            <button onClick={() => removeMarker(m.id)} style={{ background: 'none', border: 'none', color: 'var(--ud-danger)', cursor: 'pointer', fontSize: 16, padding: '8px 4px', lineHeight: 1 }}>×</button>
          </div>
        ))}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '60%', background: '#7c3aed', borderRadius: 99, animation: 'ud-bounce 1.4s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Analyzing document structure and generating chapter sync…</div>
        </div>
      )}

      {result && (
        <div style={{ marginBottom: 24 }}>
          {/* Chapters */}
          {result.chapters?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                {result.chapters.length} chapters · {result.total_duration_estimate} estimated
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {result.chapters.map((ch, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 16px', background: '#fff', border: '1px solid var(--ud-border)', borderLeft: '3px solid #7c3aed', borderRadius: 'var(--ud-radius)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#7c3aed', minWidth: 48, flexShrink: 0 }}>{ch.timestamp}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)' }}>{ch.title}</div>
                      {ch.document_section && <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginTop: 2 }}>§ {ch.document_section}</div>}
                      {ch.synopsis && <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginTop: 4, lineHeight: 1.4 }}>{ch.synopsis}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sync points count */}
          {result.sync_points?.length > 0 && (
            <div style={{ padding: '10px 14px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 16 }}>
              {result.sync_points.length} paragraph sync points embedded · Method: {result.sync_method}
            </div>
          )}

          {udsBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Advanced sync embedded ✓</div>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{udsBlob.name}</div>
              </div>
              <a href={udsBlob.url} download={udsBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}

      <button onClick={run} disabled={!docFile || processing} style={{ width: '100%', padding: '14px', background: !docFile || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !docFile || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !docFile || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Generating chapter sync…' : 'Generate Advanced Sync'}
      </button>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Media Sync Advanced differs</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          No other document format supports bidirectional synchronization between text and media. PDF cannot embed or sync media at all. Word can embed a file but has no synchronization layer. YouTube chapters are video-only with no document side.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {[
            { icon: '📕', title: 'PDF', body: 'Cannot embed synchronization data. Media can be linked externally but there is no concept of paragraph-level timestamps. No chapter markers in any structured sense.' },
            { icon: '📝', title: 'Word / DOCX', body: 'Can embed a media file as an OLE object but offers zero synchronization. No timestamps, no chapter markers, no reader navigation between text and media.' },
            { icon: '▶', title: 'YouTube chapters', body: 'Video-side chapter markers only. No document synchronized to the video. No way to navigate from a specific paragraph to a timestamp and back.' },
            { icon: '⏱', title: 'UD Media Sync Advanced', body: 'Document and media synchronized bidirectionally. Chapter markers navigate both directions. Every paragraph carries a timestamp. Every chapter links to a document section.' },
          ].map(item => (
            <div key={item.title} style={{ padding: '16px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }}>{item.title}</div>
                <p style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 24, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Powered by Claude. Sync data embedded in .uds — no external service required. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="media-sync-advanced" tips={tourSteps['media-sync-advanced']} />
    </div>
  )
}
