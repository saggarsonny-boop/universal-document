'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type InputMode = 'file' | 'text'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function ProofPage() {
  const [mode, setMode] = useState<InputMode>('file')
  const [file, setFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [title, setTitle] = useState('')
  const [creator, setCreator] = useState('')
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setError('')
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }, [title])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const generate = async () => {
    setError('')
    setResult(null)

    if (mode === 'file' && !file) { setError('Upload a file to prove.'); return }
    if (mode === 'text' && !textContent.trim()) { setError('Enter text content to prove.'); return }

    setProcessing(true)
    try {
      const now = new Date().toISOString()
      let contentHash = ''
      let sourceDesc = ''

      if (mode === 'file' && file) {
        const buf = await file.arrayBuffer()
        contentHash = 'sha256-' + await sha256hex(new Uint8Array(buf))
        sourceDesc = `file:${file.name} (${file.size} bytes, ${file.type || 'unknown type'})`
      } else {
        const enc = new TextEncoder()
        contentHash = 'sha256-' + await sha256hex(enc.encode(textContent.trim()))
        sourceDesc = `text:${textContent.trim().slice(0, 80)}${textContent.length > 80 ? '…' : ''}`
      }

      const docTitle = title.trim() || (mode === 'file' && file ? file.name : 'Untitled proof')

      const doc = {
        format: 'UDS',
        version: '1.0',
        status: 'sealed',
        metadata: {
          title: docTitle,
          created: now,
          document_type: 'proof_of_existence',
          classification: 'Proof',
          creator: creator.trim() || undefined,
          language: 'en',
        },
        content: {
          blocks: [
            {
              id: 'b1',
              type: 'heading',
              text: `Proof of Existence: ${docTitle}`,
            },
            {
              id: 'b2',
              type: 'paragraph',
              text: `This document proves that the described content existed at ${now}.`,
            },
            {
              id: 'b3',
              type: 'paragraph',
              text: `Content hash (SHA-256): ${contentHash}`,
            },
            {
              id: 'b4',
              type: 'paragraph',
              text: `Source: ${sourceDesc}`,
            },
            ...(creator.trim() ? [{
              id: 'b5',
              type: 'paragraph' as const,
              text: `Creator/Identifier: ${creator.trim()}`,
            }] : []),
          ],
        },
        provenance: {
          created: now,
          hash: contentHash,
          source: sourceDesc,
          blockchain: null,
          proof_type: 'sha256_existence',
          creator: creator.trim() || undefined,
        },
      }

      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = docTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 48)
      setResult({ url: URL.createObjectURL(blob), name: `proof-${safeName}.uds` })
    } catch (e) {
      setError('Failed to generate proof. Please try again.')
      console.error(e)
    }
    setProcessing(false)
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = mode === 'file' ? !!file : !!textContent.trim()

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Proof</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free · 3/month</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Cryptographic proof that your document, idea, or creative work existed at this exact moment. The SHA-256 hash and timestamp live inside the .uds file itself — not in our database.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ All Pro features free during beta · No account required
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['file', 'text'] as InputMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError('') }}
            style={{ padding: '8px 18px', borderRadius: 'var(--ud-radius)', border: `1px solid ${mode === m ? 'var(--ud-teal)' : 'var(--ud-border)'}`, background: mode === m ? 'var(--ud-teal-2)' : '#fff', color: mode === m ? 'var(--ud-teal)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {m === 'file' ? 'Upload file' : 'Paste text'}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      {mode === 'file' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 20, transition: 'all 0.15s' }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }}>🔏</div>
          {file ? (
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>{file.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ud-muted)' }}>{(file.size / 1024).toFixed(1)} KB · Click to change</div>
            </div>
          ) : (
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 4 }}>Drop any file here</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>Any format, up to 50 MB · or click to browse</div>
            </div>
          )}
          <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      )}

      {/* Text input */}
      {mode === 'text' && (
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Content to prove</label>
          <textarea
            rows={6}
            value={textContent}
            onChange={e => { setTextContent(e.target.value); setResult(null) }}
            placeholder="Paste your idea, invention description, creative work, code, or any text you want to timestamp..."
            style={{ ...inp, resize: 'vertical' }}
          />
        </div>
      )}

      {/* Optional fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Title / description of what you&apos;re proving</label>
          <input style={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. My invention for a self-cleaning coffee mug" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Your name or identifier (optional)</label>
          <input style={inp} value={creator} onChange={e => setCreator(e.target.value)} placeholder="e.g. Jane Smith or @janesmith" />
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Proof sealed ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>SHA-256 hash embedded in .uds provenance</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button
        onClick={generate}
        disabled={!ready || processing}
        style={{ width: '100%', padding: '14px', background: !ready || processing ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready || processing ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready || processing ? 'not-allowed' : 'pointer' }}>
        {processing ? 'Generating proof…' : 'Generate proof →'}
      </button>

      {/* Why pre-register */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>When proof of existence matters</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Creative work', body: 'Prove your screenplay, artwork, music, or writing existed before a dispute arises.' },
            { title: 'Invention ideas', body: 'Establish prior art for patent applications without filing a patent first.' },
            { title: 'Business plans', body: 'Timestamp your concept, strategy, or product design before sharing with investors.' },
            { title: 'Research data', body: 'Prove your dataset or results existed at a specific date — before analysis or publication.' },
          ].map(item => (
            <div key={item.title} style={card}>
              <div style={h3s}>{item.title}</div>
              <p style={p13}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison section */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>Why UD Proof beats alternatives</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Proving something existed at a specific moment has historically required lawyers, notaries, or expensive cryptographic timestamping services. UD Proof does it in seconds, for free.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '📧', title: 'Email to yourself', body: 'No tamper evidence. Easily backdated or faked. Not admissible in most commercial disputes.' },
            { icon: '📄', title: 'PDF timestamp', body: 'Visual only — the timestamp is a text overlay that can be removed or altered. Not cryptographic.' },
            { icon: '⛓', title: 'Cryptographic timestamping services', body: 'Typically $10–50 per proof, require crypto wallets, and create platform dependency. Complex for non-technical users.' },
            { icon: '🔏', title: 'UD Proof', body: 'Free for 3 proofs/month. SHA-256 hash embedded in the .uds file. Mathematically verifiable. No wallet. No account. Proof lives in the document.' },
          ].map(item => (
            <div key={item.title} style={{ ...card, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20, lineHeight: '1', flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
              <div>
                <div style={h3s}>{item.title}</div>
                <p style={p13}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Hashing runs in your browser. Content never leaves your device. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="proof" tips={tourSteps['proof']} />
    </div>
  )
}
