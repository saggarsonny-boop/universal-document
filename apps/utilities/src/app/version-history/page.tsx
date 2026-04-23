'use client'
import { useState, useRef, useCallback } from 'react'

interface VersionEntry {
  version: string
  at: string
  by?: string
  note?: string
  hash?: string
  type: 'created' | 'modified' | 'sealed' | 'translated' | 'classified' | 'summarised' | 'accessibility' | 'clinical' | 'revoked' | 'expired' | 'other'
}

const TYPE_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  created:       { color: 'var(--ud-teal)',   bg: 'var(--ud-teal-2)',          label: 'Created'        },
  sealed:        { color: '#0a7a6a',           bg: '#c5f0e8',                   label: 'Sealed'         },
  modified:      { color: 'var(--ud-gold)',    bg: 'var(--ud-gold-3)',          label: 'Modified'       },
  translated:    { color: '#6b5adf',           bg: '#ede9ff',                   label: 'Translated'     },
  classified:    { color: '#d17a30',           bg: 'rgba(226,120,50,0.1)',      label: 'Classified'     },
  summarised:    { color: 'var(--ud-teal)',    bg: 'var(--ud-teal-2)',          label: 'Summarised'     },
  accessibility: { color: 'var(--ud-teal)',    bg: 'var(--ud-teal-2)',          label: 'Accessibility'  },
  clinical:      { color: '#d17a30',           bg: 'rgba(226,120,50,0.1)',      label: 'Clinical'       },
  revoked:       { color: 'var(--ud-danger)',  bg: 'rgba(226,75,74,0.1)',       label: 'Revoked'        },
  expired:       { color: 'var(--ud-muted)',   bg: 'var(--ud-paper-2)',         label: 'Expired'        },
  other:         { color: 'var(--ud-muted)',   bg: 'var(--ud-paper-2)',         label: 'Updated'        },
}

function fmt(ts?: string) {
  if (!ts) return '—'
  try { return new Date(ts).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' }) } catch { return ts }
}

function parseVersions(doc: Record<string, unknown>): VersionEntry[] {
  const entries: VersionEntry[] = []
  const prov = typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}
  const hist = Array.isArray(doc.history) ? doc.history as Record<string, unknown>[] : []
  const cl = typeof doc.clarity_layers === 'object' && doc.clarity_layers ? doc.clarity_layers as Record<string, unknown> : {}

  if (prov.created_at) entries.push({ version: '1.0', at: prov.created_at as string, by: prov.created_by as string | undefined, type: 'created', note: 'Document created' })
  if (prov.sealed_at) entries.push({ version: '—', at: prov.sealed_at as string, by: prov.sealed_by as string | undefined, type: 'sealed', note: 'Document sealed' })
  if (prov.accessibility_checked_at) entries.push({ version: '—', at: prov.accessibility_checked_at as string, type: 'accessibility', note: 'Accessibility check performed' })
  if (prov.classified_at) entries.push({ version: '—', at: prov.classified_at as string, type: 'classified', note: `Classified: ${(cl.classification_report as Record<string, unknown>)?.classification ?? '—'}` })
  if (prov.clinical_summary_generated_at) entries.push({ version: '—', at: prov.clinical_summary_generated_at as string, type: 'clinical', note: 'Clinical summary generated' })
  if (prov.revoked_at) entries.push({ version: '—', at: prov.revoked_at as string, type: 'revoked', note: (doc.revocation as Record<string, unknown>)?.reason as string ?? 'Document revoked' })
  if (prov.expires_at) entries.push({ version: '—', at: prov.expiry_set_at as string ?? prov.expires_at as string, type: 'expired', note: `Expires: ${fmt(prov.expires_at as string)}` })

  // Languages (translations)
  if (typeof doc.languages === 'object' && doc.languages) {
    for (const lang of Object.keys(doc.languages as Record<string, unknown>)) {
      const l = (doc.languages as Record<string, Record<string, unknown>>)[lang]
      if (l?.translated_at) entries.push({ version: '—', at: l.translated_at as string, type: 'translated', note: `Translated to ${lang}` })
    }
  }

  // Clarity layer summary
  if ((cl.summary as Record<string, unknown>)?.generated_at) {
    entries.push({ version: '—', at: (cl.summary as Record<string, unknown>).generated_at as string, type: 'summarised', note: 'Summary generated' })
  }

  // History array
  for (const h of hist) {
    entries.push({ version: h.version as string ?? '—', at: h.at as string, by: h.by as string, note: h.note as string, type: (h.type as VersionEntry['type']) ?? 'other', hash: h.hash as string })
  }

  return entries.filter(e => e.at).sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

export default function VersionHistory() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [versions, setVersions] = useState<VersionEntry[] | null>(null)
  const [docTitle, setDocTitle] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => {
    if (!f) return
    setFile(f); setVersions(null); setError('')
    f.text().then(text => {
      try {
        const doc = JSON.parse(text)
        setDocTitle(doc.title ?? doc.filename ?? f.name)
        const parsed = parseVersions(doc)
        if (parsed.length === 0) setError('No version history found in this document.')
        else setVersions(parsed)
      } catch {
        setError('File does not appear to be a valid .uds or .udr file.')
      }
    })
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Version History</h1>
        <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>FREE</span>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Parse the full provenance timeline of any Universal Document™. All operations — creation, sealing, translation, classification, revocation — shown as a chronological audit trail.
      </p>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file
          ? <div><div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📋 {file.name}</div><div style={{ fontSize: 12, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div></div>
          : <div><div style={{ fontSize: 32, marginBottom: 12 }}>📋</div><div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>Drop your .uds file here</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse · .uds .udr</div></div>}
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}

      {versions && versions.length > 0 && (
        <div>
          {docTitle && <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 20 }}>{docTitle} · {versions.length} event{versions.length !== 1 ? 's' : ''}</div>}
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, width: 2, background: 'var(--ud-border)', borderRadius: 1 }} />
            {versions.map((v, i) => {
              const s = TYPE_STYLE[v.type] ?? TYPE_STYLE.other
              return (
                <div key={i} style={{ position: 'relative', marginBottom: 20 }}>
                  <div style={{ position: 'absolute', left: -24, top: 3, width: 14, height: 14, borderRadius: '50%', background: s.color, border: '2px solid #fff', boxShadow: `0 0 0 2px ${s.color}` }} />
                  <div style={{ padding: '12px 14px', background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--ud-radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</span>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{fmt(v.at)}</span>
                    </div>
                    {v.note && <div style={{ fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', marginBottom: v.by || v.hash ? 4 : 0 }}>{v.note}</div>}
                    {v.by && <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>By: {v.by}</div>}
                    {v.hash && <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginTop: 4, wordBreak: 'break-all', opacity: 0.7 }}>{v.hash.slice(0, 40)}…</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs entirely in your browser. No data is sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
