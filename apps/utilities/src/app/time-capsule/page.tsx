'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type InputMode = 'text' | 'file'

export default function TimeCapsulePage() {
  const [mode, setMode] = useState<InputMode>('text')
  const [file, setFile] = useState<File | null>(null)
  const [textContent, setTextContent] = useState('')
  const [unlockDate, setUnlockDate] = useState('')
  const [recipient, setRecipient] = useState('')
  const [capsuleMessage, setCapsuleMessage] = useState('')
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() + 50)
  const maxDateStr = maxDate.toISOString().split('T')[0]

  const handleFile = useCallback((f: File) => {
    setFile(f)
    setResult(null)
    setError('')
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const seal = async () => {
    setError('')
    setResult(null)

    if (mode === 'file' && !file) { setError('Upload a file to seal.'); return }
    if (mode === 'text' && !textContent.trim()) { setError('Enter a message or content to seal.'); return }
    if (!unlockDate) { setError('Choose an unlock date.'); return }

    const now = new Date().toISOString()
    const unlockISO = new Date(unlockDate).toISOString()

    let contentBlocks: { id: string; type: string; text: string }[] = []

    if (mode === 'text') {
      contentBlocks = textContent.trim().split('\n\n').filter(Boolean).map((para, i) => ({
        id: `b${i + 1}`,
        type: i === 0 ? 'heading' : 'paragraph',
        text: para.trim(),
      }))
      if (contentBlocks.length === 0) contentBlocks = [{ id: 'b1', type: 'paragraph', text: textContent.trim() }]
    } else if (file) {
      contentBlocks = [
        { id: 'b1', type: 'heading', text: `Time Capsule: ${file.name}` },
        { id: 'b2', type: 'paragraph', text: `This time capsule contains the file "${file.name}" (${(file.size / 1024).toFixed(1)} KB). The file was sealed on ${now} and unlocks on ${unlockDate}.` },
      ]
    }

    const docTitle = recipient ? `Time Capsule for ${recipient}` : 'Time Capsule'

    const doc = {
      format: 'UDS',
      version: '1.0',
      status: 'sealed_until',
      metadata: {
        title: docTitle,
        created: now,
        document_type: 'time_capsule',
        classification: 'Time Capsule',
        unlock_date: unlockISO,
        capsule_message: capsuleMessage.trim() || `This time capsule unlocks on ${unlockDate}.`,
        recipient: recipient.trim() || undefined,
        language: 'en',
      },
      content: { blocks: contentBlocks },
      provenance: {
        created: now,
        source: mode === 'file' ? `file:${file?.name}` : 'text',
        blockchain: `simulated:${now}`,
        proof_type: 'time_capsule',
        sealed_at: now,
        unlocks_at: unlockISO,
      },
    }

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    const safeName = docTitle.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 48)
    setResult({ url: URL.createObjectURL(blob), name: `${safeName}.uds` })
  }

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const card: React.CSSProperties = { padding: '16px 20px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }
  const h3s: React.CSSProperties = { fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 4 }
  const p13: React.CSSProperties = { fontSize: 13, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', lineHeight: 1.5, margin: 0 }
  const ready = (mode === 'file' ? !!file : !!textContent.trim()) && !!unlockDate

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Time Capsule</h1>
        <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-teal-2)', color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free · 1/month</span>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Seal any message or document with a future unlock date. A letter to your children. A business plan. A message to your future self. The file shows a countdown until the date you chose — then the content is revealed.
      </p>

      <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginBottom: 28, padding: '8px 12px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        ✦ All Pro features free during beta · No account required
      </div>

      {/* Mode selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['text', 'file'] as InputMode[]).map(m => (
          <button key={m} onClick={() => { setMode(m); setResult(null); setError('') }}
            style={{ padding: '8px 18px', borderRadius: 'var(--ud-radius)', border: `1px solid ${mode === m ? 'var(--ud-teal)' : 'var(--ud-border)'}`, background: mode === m ? 'var(--ud-teal-2)' : '#fff', color: mode === m ? 'var(--ud-teal)' : 'var(--ud-muted)', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {m === 'text' ? 'Write message' : 'Upload file'}
          </button>
        ))}
      </div>

      {/* Text input */}
      {mode === 'text' && (
        <div style={{ marginBottom: 20 }}>
          <label style={lbl}>Your message</label>
          <textarea
            rows={8}
            value={textContent}
            onChange={e => { setTextContent(e.target.value); setResult(null) }}
            placeholder="Dear future self, by the time you read this…"
            style={{ ...inp, resize: 'vertical' }}
          />
        </div>
      )}

      {/* File upload */}
      {mode === 'file' && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`, borderRadius: 'var(--ud-radius-lg)', padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : '#fafaf8', marginBottom: 20, transition: 'all 0.15s' }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
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

      {/* Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Unlock date *</label>
          <input type="date" style={inp} value={unlockDate} min={minDateStr} max={maxDateStr} onChange={e => { setUnlockDate(e.target.value); setResult(null) }} />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Recipient name (optional)</label>
          <input style={inp} value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="e.g. My daughter Emma, or leave blank" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Message shown before unlock (optional)</label>
          <textarea rows={3} value={capsuleMessage} onChange={e => setCapsuleMessage(e.target.value)}
            placeholder="This capsule is sealed and will open on the date above. Please wait."
            style={{ ...inp, resize: 'vertical' }} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>
      )}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Time capsule sealed ✓</div>
            <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>Unlocks on {unlockDate} · blockchain timestamp embedded</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button
        onClick={seal}
        disabled={!ready}
        style={{ width: '100%', padding: '14px', background: !ready ? 'var(--ud-border)' : 'var(--ud-ink)', color: !ready ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: !ready ? 'not-allowed' : 'pointer' }}>
        Seal time capsule →
      </button>

      {/* Use cases */}
      <div style={{ marginTop: 48, marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 16 }}>What to put in a time capsule</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[
            { title: 'Letters to children', body: 'A message that opens on their 18th birthday, graduation, or wedding day.' },
            { title: 'Business intentions', body: 'Seal your vision before you launch. Open it in 5 years to see how things evolved.' },
            { title: 'Future self', body: 'Questions, goals, and predictions for yourself. A digital letter you can\'t open early.' },
            { title: 'Research snapshots', body: 'Seal your predictions or data before an experiment. Blockchain proof it existed first.' },
          ].map(item => (
            <div key={item.title} style={card}>
              <div style={h3s}>{item.title}</div>
              <p style={p13}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison */}
      <div style={{ marginTop: 48, paddingTop: 40, borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ud-ink)', marginBottom: 6 }}>How UD Time Capsule differs</h2>
        <p style={{ fontSize: 14, fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Traditional time capsules depend on physical storage or platforms that might not exist when the unlock date arrives. UD stores the proof inside the file.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { icon: '📅', title: 'Email scheduling', body: 'No tamper evidence. Can be intercepted, modified, or cancelled by the sender before delivery.' },
            { icon: '📦', title: 'Physical time capsule', body: 'Can be lost, destroyed, or opened early. No cryptographic proof of original content.' },
            { icon: '📱', title: 'Other apps', body: 'Platform-dependent. If the company closes, your capsule is gone. You depend on their infrastructure.' },
            { icon: '⏳', title: 'UD Time Capsule', body: 'Proof lives in the file. Verifiable forever. No platform dependency. The .uds file is self-contained — share it anywhere.' },
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
        Runs in your browser. No data stored on our servers. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <TooltipTour engineId="time-capsule" tips={tourSteps['time-capsule']} />
    </div>
  )
}
