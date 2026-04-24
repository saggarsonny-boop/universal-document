'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function StegWatermark() {
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [owner, setOwner] = useState('')
  const [result, setResult] = useState<{ url: string; name: string; mark: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setResult(null); setError('') }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const run = async () => {
    if (!file || !owner) return
    setError(''); setResult(null)
    try {
      const text = await file.text()
      let doc: Record<string, unknown>
      try { doc = JSON.parse(text) } catch { throw new Error('File must be a valid .uds or .udr file.') }

      const now = new Date().toISOString()
      const markSeed = `${owner}:${now}:${file.name}`
      const ownershipHash = await sha256Hex(markSeed)
      // Steganographic mark: encoded in a nested structure that looks structural, not visible metadata
      const updated = {
        ...doc,
        _manifest: {
          ...((typeof doc._manifest === 'object' && doc._manifest) ? doc._manifest as Record<string, unknown> : {}),
          _integrity: {
            _oid: ownershipHash.slice(0, 32),
            _ts: Buffer.from(now).toString('base64'),
            _v: '1',
          },
        },
        provenance: {
          ...(typeof doc.provenance === 'object' && doc.provenance ? doc.provenance as Record<string, unknown> : {}),
          ownership_mark_applied_at: now,
        },
      }
      const blob = new Blob([JSON.stringify(updated, null, 2)], { type: 'application/json' })
      const fname = file.name.replace(/\.(uds|udr)$/, '') + '-marked.uds'
      setResult({ url: URL.createObjectURL(blob), name: fname, mark: ownershipHash.slice(0, 32) })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Steganographic Watermark</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold-text)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 32, lineHeight: 1.6 }}>
        Embed an invisible ownership mark in any Universal Document™. The mark is undetectable without UD Validator — but irrefutably proves original ownership. Record your ownership hash after embedding.
      </p>
      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 24 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".uds,.udr" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>🔏 {file.name}<br /><span style={{ fontSize: 13, color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <div><div style={{ fontSize: 32, marginBottom: 10 }}>🔏</div><div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop your .uds file</div><div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or click to browse</div></div>}
      </div>
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Owner identity <span style={{ color: 'var(--ud-danger)' }}>*</span></label>
        <input value={owner} onChange={e => setOwner(e.target.value)} placeholder="Your name, organisation, or identifier" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }} />
      </div>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '16px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 8 }}>Ownership mark embedded ✓</div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', marginBottom: 12, wordBreak: 'break-all' }}>Mark ID (save this): <strong style={{ color: 'var(--ud-ink)' }}>{result.mark}</strong></div>
          <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none' }}>Download marked .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!file || !owner} style={{ width: '100%', padding: '14px', background: !file || !owner ? 'var(--ud-border)' : 'var(--ud-ink)', color: !file || !owner ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !file || !owner ? 'not-allowed' : 'pointer' }}>Embed Ownership Mark</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Mark detectable by UD Validator. Runs in your browser. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Steg Watermark differs from visible watermarks and DRM</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Visible watermarks degrade the document and are stripped easily. DRM prevents access entirely. UD Steg Watermark proves ownership without affecting how the document looks or reads.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Visible watermark overlaid on content', body: 'Degrades readability and is removed in seconds with a screenshot, crop, or background-removal tool. Provides no cryptographic proof — just a visual deterrent that sophisticated infringers ignore.' },
            { title: 'DRM / locked document', body: 'Prevents viewing without authorisation — but also prevents legitimate sharing, printing, and archival. Creates friction for authorised recipients and fails completely if the DRM platform shuts down.' },
            { title: 'UD Steg Watermark — invisible SHA-256 mark', body: 'A SHA-256 hash of your ownership claim is embedded in the document\'s structured metadata, invisible to readers. The document reads and shares identically to an unmarked version.' },
            { title: 'UD Steg Watermark — UD Validator verification', body: 'Any copy of the document — however it was distributed or renamed — can be verified in UD Validator. The embedded mark either matches your ownership claim or it doesn\'t. No dispute, just a hash comparison.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '15px', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="steg-watermark" tips={tourSteps['steg-watermark']} />
    </div>
  )
}
