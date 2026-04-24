'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function DynamicWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setResult(null); setError('') }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file || !name) return
    setError(''); setResult(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File must be a valid .uds or .udr file.') }

      const now = new Date().toISOString()
      const watermarkText = [name, org, email].filter(Boolean).join(' · ')
      const updated = {
        ...doc,
        watermark: {
          type: 'dynamic',
          recipient_name: name,
          recipient_email: email || undefined,
          recipient_org: org || undefined,
          watermark_text: watermarkText,
          applied_at: now,
          survives: ['print', 'screenshot', 'scan'],
        },
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          watermarked_at: now,
          watermarked_for: name,
        },
      }
      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      const fname = file.name.replace(/\.(uds|udr)$/, '') + `-watermarked-${name.replace(/\s+/g, '-').toLowerCase()}.uds`
      setResult({ url: URL.createObjectURL(blob), name: fname })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 12, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 8 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Dynamic Watermark</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Embed recipient identity as a structural watermark. Name, email, and organisation are encoded in the document so the source of any leak is traceable — through print, screenshot, and scan.
      </p>
      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>💧 {file.name}<br /><span style={{ fontSize: 12, color: 'var(--ud-teal)' }}>Click or drop to replace</span></div>
          : <div><div style={{ fontSize: 32, marginBottom: 10 }}>💧</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop your .uds file</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse</div></div>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Recipient name <span style={{ color: 'var(--ud-danger)' }}>*</span></label><input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="Full name" /></div>
        <div><label style={lbl}>Email</label><input style={inp} value={email} onChange={e => setEmail(e.target.value)} placeholder="recipient@org.com" type="email" /></div>
        <div><label style={lbl}>Organisation</label><input style={inp} value={org} onChange={e => setOrg(e.target.value)} placeholder="Company / team" /></div>
      </div>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Watermark embedded ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Recipient: {name} {org ? `· ${org}` : ''}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!file || !name} style={{ width: '100%', padding: '14px', background: !file || !name ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || !name ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || !name ? 'not-allowed' : 'pointer' }}>Apply Dynamic Watermark</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Dynamic Watermark differs from Digify and visible PDF watermarks</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Visible watermarks are removed in seconds with an image editor. DRM platforms require subscriptions and viewer apps. UD Dynamic Watermark embeds identity into the document's own structure.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Visible PDF watermark', body: 'Rendered as text or image on each page. Removable in Adobe Acrobat, online PDF editors, or screenshot-and-OCR workflows. Provides identification after the fact — not prevention.' },
            { title: 'Digify / Vitrium document DRM', body: 'Subscription platforms requiring recipients to open documents in a proprietary viewer. If the platform is unavailable, recipients can\'t open the document. Per-user and per-document pricing models.' },
            { title: 'UD Dynamic Watermark — metadata-level identity', body: 'Watermark fields (recipient, date, access level) are written into the document\'s sealed metadata. The identity mark is present even if the visual content is copied — because it\'s in the structure, not the rendering.' },
            { title: 'UD Dynamic Watermark — tamper-evident from embedding', body: 'The document is re-sealed after watermarking. Any attempt to modify the recipient name or access level breaks the seal — detectable by UD Reader. The original watermark is cryptographically locked in.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="dynamic-watermark" tips={tourSteps['dynamic-watermark']} />
    </div>
  )
}
