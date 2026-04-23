'use client'
import { useState, useRef, useCallback } from 'react'

interface Event { label: string; at: string; by?: string; detail?: string; hash?: string; category: string }
const CAT_COLOR: Record<string, string> = { provenance: 'var(--ud-teal)', security: 'var(--ud-gold)', ai: '#6b5adf', lifecycle: 'var(--ud-danger)', content: 'var(--ud-muted)' }
const fmt = (ts: string) => { try { return new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return ts } }

function extractEvents(doc: Record<string, unknown>): Event[] {
  const ev: Event[] = []
  const p = typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}
  const cl = typeof doc.clarity_layers === 'object' && doc.clarity_layers ? doc.clarity_layers as Record<string, unknown> : {}
  if (p.created_at) ev.push({ label: 'Document created', at: p.created_at as string, by: p.created_by as string, category: 'provenance' })
  if (p.sealed_at) ev.push({ label: 'Document sealed', at: p.sealed_at as string, by: p.sealed_by as string, category: 'provenance' })
  if (p.last_modified_at) ev.push({ label: 'Metadata edited', at: p.last_modified_at as string, by: p.last_modified_by as string, category: 'content' })
  if (p.watermarked_at) ev.push({ label: 'Watermark applied', at: p.watermarked_at as string, detail: `Recipient: ${p.watermarked_for ?? '—'}`, category: 'security' })
  if (p.ownership_mark_applied_at) ev.push({ label: 'Steganographic mark applied', at: p.ownership_mark_applied_at as string, category: 'security' })
  if (p.expires_at) ev.push({ label: 'Expiry set', at: p.expiry_set_at as string ?? p.expires_at as string, detail: `Expires: ${fmt(p.expires_at as string)}`, category: 'lifecycle' })
  if (p.revoked_at) ev.push({ label: 'Document revoked', at: p.revoked_at as string, detail: (doc.revocation as Record<string, unknown>)?.reason as string, category: 'lifecycle' })
  if (p.accessibility_checked_at) ev.push({ label: 'Accessibility check', at: p.accessibility_checked_at as string, category: 'ai' })
  if (p.classified_at) ev.push({ label: 'Classification applied', at: p.classified_at as string, detail: (cl.classification_report as Record<string, unknown>)?.classification as string, category: 'ai' })
  if (p.clinical_summary_generated_at) ev.push({ label: 'Clinical summary generated', at: p.clinical_summary_generated_at as string, category: 'ai' })
  if ((cl.summary as Record<string, unknown>)?.generated_at) ev.push({ label: 'AI summary generated', at: (cl.summary as Record<string, unknown>).generated_at as string, category: 'ai' })
  if (typeof doc.languages === 'object' && doc.languages) {
    for (const lang of Object.keys(doc.languages as Record<string, unknown>)) {
      const l = (doc.languages as Record<string, Record<string, unknown>>)[lang]
      if (l?.translated_at) ev.push({ label: `Translated → ${lang}`, at: l.translated_at as string, category: 'ai' })
    }
  }
  if (Array.isArray(doc.history)) {
    for (const h of doc.history as Record<string, unknown>[]) {
      if (h.at) ev.push({ label: h.note as string ?? 'History event', at: h.at as string, by: h.by as string, hash: h.hash as string, category: 'provenance' })
    }
  }
  return ev.filter(e => e.at).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

export default function AuditTrail() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [events, setEvents] = useState<Event[] | null>(null)
  const [docTitle, setDocTitle] = useState('')
  const [error, setError] = useState('')
  const [auditBlob, setAuditBlob] = useState<{ url: string; name: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => {
    if (!f) return; setFile(f); setEvents(null); setError(''); setAuditBlob(null)
    f.text().then(text => {
      try {
        const doc = JSON.parse(text) as Record<string, unknown>
        setDocTitle((doc.title as string) ?? f.name)
        const evs = extractEvents(doc)
        if (!evs.length) { setError('No audit events found in this document.'); return }
        setEvents(evs)
        const report = { format: 'UDS', title: `Audit Trail — ${doc.title ?? f.name}`, content: `Audit trail extracted from: ${f.name}\nTotal events: ${evs.length}`, audit_events: evs, provenance: { generated_at: new Date().toISOString(), source_file: f.name } }
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
        setAuditBlob({ url: URL.createObjectURL(blob), name: f.name.replace(/\.(uds|udr|udz)$/, '') + '-audit.uds' })
      } catch { setError('File must be a valid .uds, .udr, or .udz file.') }
    })
  }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Audit Trail</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>Complete provenance chain — every creation, modification, AI analysis, watermark, translation, seal, and revocation event extracted with timestamps. Downloadable as a .uds audit report.</p>
      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr,.udz" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🔎 {file.name}<br /><span style={{ fontSize: 12, color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <div><div style={{ fontSize: 32, marginBottom: 10 }}>🔎</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop your document</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr .udz</div></div>}
      </div>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {events && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 16 }}>{docTitle} · {events.length} event{events.length !== 1 ? 's' : ''} found</div>
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'var(--ud-border)', borderRadius: 1 }} />
            {events.map((ev, i) => {
              const c = CAT_COLOR[ev.category] ?? 'var(--ud-muted)'
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 14 }}>
                  <div style={{ position: 'absolute', left: -24, top: 4, width: 12, height: 12, borderRadius: '50%', background: c }} />
                  <div style={{ padding: '10px 14px', background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: ev.detail || ev.by ? 4 : 0 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>{ev.label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{fmt(ev.at)}</span>
                    </div>
                    {(ev.by || ev.detail) && <div style={{ fontSize: 11, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>{[ev.by, ev.detail].filter(Boolean).join(' · ')}</div>}
                    {ev.hash && <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginTop: 4, opacity: 0.7, wordBreak: 'break-all' }}>{ev.hash.slice(0, 48)}…</div>}
                  </div>
                </div>
              )
            })}
          </div>
          {auditBlob && (
            <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Audit report ready</div>
              <a href={auditBlob.url} download={auditBlob.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Download .uds →</a>
            </div>
          )}
        </div>
      )}
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
