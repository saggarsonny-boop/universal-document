'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface CustodyEvent {
  label: string
  timestamp: string | null
  detail?: string
  hash?: string
}

function parseEvents(doc: Record<string, unknown>): CustodyEvent[] {
  const events: CustodyEvent[] = []
  const prov = (typeof doc.provenance === 'object' && doc.provenance !== null) ? doc.provenance as Record<string, unknown> : {}

  if (doc.created_at || prov.created_at) {
    events.push({ label: 'Created', timestamp: String(doc.created_at || prov.created_at || ''), detail: typeof prov.created_by === 'string' ? prov.created_by : undefined })
  }
  if (prov.sealed_at) {
    events.push({ label: 'Sealed', timestamp: String(prov.sealed_at), detail: typeof prov.sealed_by === 'string' ? prov.sealed_by : undefined })
  }
  if (doc.modified_at || prov.modified_at) {
    events.push({ label: 'Modified', timestamp: String(doc.modified_at || prov.modified_at || ''), detail: typeof prov.modified_by === 'string' ? prov.modified_by : undefined })
  }
  if (doc.expires_at || prov.expires_at) {
    events.push({ label: 'Expires', timestamp: String(doc.expires_at || prov.expires_at || '') })
  }
  if (doc.revoked_at || prov.revoked_at) {
    events.push({ label: 'Revoked', timestamp: String(doc.revoked_at || prov.revoked_at || ''), detail: typeof prov.revoked_by === 'string' ? prov.revoked_by : undefined })
  }
  if (prov.hash) {
    events.push({ label: 'Content hash', timestamp: null, hash: String(prov.hash) })
  }

  const history = Array.isArray(doc.history) ? doc.history as Record<string, unknown>[] : []
  history.forEach((h, i) => {
    events.push({ label: `Version ${i + 1}`, timestamp: typeof h.timestamp === 'string' ? h.timestamp : null, detail: typeof h.action === 'string' ? h.action : undefined, hash: typeof h.hash === 'string' ? h.hash : undefined })
  })

  events.sort((a, b) => {
    if (!a.timestamp) return 1
    if (!b.timestamp) return -1
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  })

  return events
}

function fmt(ts: string | null) {
  if (!ts) return null
  try { return new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return ts }
}

const labelColors: Record<string, { bg: string; text: string; dot: string }> = {
  Created:      { bg: 'var(--ud-teal-2)',  text: 'var(--ud-teal)', dot: 'var(--ud-teal)' },
  Sealed:       { bg: 'var(--ud-gold-3)',  text: 'var(--ud-gold)', dot: 'var(--ud-gold)' },
  Modified:     { bg: 'var(--ud-paper-2)', text: 'var(--ud-ink)',  dot: 'var(--ud-muted)' },
  Expires:      { bg: 'var(--ud-paper-2)', text: 'var(--ud-ink)',  dot: 'var(--ud-muted)' },
  Revoked:      { bg: 'rgba(226,75,74,0.08)', text: 'var(--ud-danger)', dot: 'var(--ud-danger)' },
  'Content hash': { bg: 'var(--ud-paper-2)', text: 'var(--ud-muted)', dot: 'var(--ud-border)' },
}
function colors(label: string) {
  return labelColors[label] ?? { bg: 'var(--ud-paper-2)', text: 'var(--ud-ink)', dot: 'var(--ud-muted)' }
}

export default function ChainOfCustody() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [events, setEvents] = useState<CustodyEvent[] | null>(null)
  const [docMeta, setDocMeta] = useState<{ title?: string; status?: string; format?: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | null) => {
    if (!f) return
    setFile(f)
    setEvents(null)
    setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const parse = async () => {
    if (!file) return
    setError('')
    setEvents(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File does not appear to be a valid .uds document.') }
      setDocMeta({ title: typeof doc.title === 'string' ? doc.title : file.name, status: typeof doc.status === 'string' ? doc.status : undefined, format: typeof doc.format === 'string' ? doc.format : undefined })
      const evts = parseEvents(doc)
      if (evts.length === 0) throw new Error('No provenance data found in this document. The file may not contain custody metadata.')
      setEvents(evts)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not parse document')
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Chain of Custody</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Parse a Universal Document™ file and display its full provenance timeline — created, sealed, modified, expired, and revoked events with timestamps and hashes.
      </p>

      <div
        style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '48px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'border-color 0.2s, background 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept=".uds,.udr,.udz" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? (
          <div>
            <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>📄 {file.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔗</div>
            <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .uds file here</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr .udz</div>
          </div>
        )}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {events && docMeta && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ padding: '14px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 }}>{docMeta.title}</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {docMeta.format && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Format: {docMeta.format}</span>}
              {docMeta.status && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: docMeta.status === 'sealed' ? 'var(--ud-gold)' : docMeta.status === 'revoked' ? 'var(--ud-danger)' : 'var(--ud-teal)' }}>Status: {docMeta.status}</span>}
            </div>
          </div>

          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 10, top: 8, bottom: 8, width: 2, background: 'var(--ud-border)', borderRadius: 2 }} />
            {events.map((evt, i) => {
              const c = colors(evt.label)
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                  <div style={{ position: 'absolute', left: -24, top: 14, width: 10, height: 10, borderRadius: '50%', background: c.dot, border: '2px solid var(--ud-paper)', boxShadow: '0 0 0 2px ' + c.dot }} />
                  <div style={{ padding: '12px 16px', background: c.bg, border: `1px solid var(--ud-border)`, borderRadius: 'var(--ud-radius)', }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: c.text }}>{evt.label}</span>
                      {evt.timestamp && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', whiteSpace: 'nowrap' }}>{fmt(evt.timestamp)}</span>}
                    </div>
                    {evt.detail && <div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 4 }}>{evt.detail}</div>}
                    {evt.hash && <div style={{ fontSize: 11, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', marginTop: 6, wordBreak: 'break-all', opacity: 0.7 }}>{evt.hash}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button onClick={parse} disabled={!file} style={{ width: '100%', padding: '14px', background: !file ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}>
        Show Chain of Custody
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Processed entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
      <TooltipTour engineId="chain-of-custody" tips={tourSteps['chain-of-custody']} />
    </div>
  )
}
