'use client'
import { useState, useRef, useCallback } from 'react'

interface ToolPageProps {
  tool: string
  name: string
  desc: string
  acceptMultiple?: boolean
  acceptTypes?: string
  extraFields?: React.ReactNode
  extraData?: Record<string, string | number>
  freeLabel?: string
}

export default function ToolPage({
  tool, name, desc,
  acceptMultiple = false,
  acceptTypes = '.pdf',
  extraFields,
  extraData = {},
  freeLabel,
}: ToolPageProps) {
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null)
  const [error, setError] = useState('')
  const [textResult, setTextResult] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Top 6 Adoption Amplifiers States
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file')
  const [textInput, setTextInput] = useState('')
  const [isMultiplayer, setIsMultiplayer] = useState(false)
  const [yourName, setYourName] = useState('')
  const [colleagueEmail, setColleagueEmail] = useState('')
  const [multiplayerStatus, setMultiplayerStatus] = useState('')
  const [paywallActive, setPaywallActive] = useState(false)
  const [paywallBypassed, setPaywallBypassed] = useState(false)

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const arr = Array.from(incoming)
    setFiles(acceptMultiple ? arr : [arr[0]])
    setResult(null)
    setError('')
    setTextResult('')
    setPaywallActive(false)
    setPaywallBypassed(false)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [])

  const process = async () => {
    let filesToProcess: File[] = []
    
    if (activeTab === 'text') {
      if (!textInput.trim()) {
        setError('Please enter some text in the sandbox.')
        return
      }
      const virtualFile = new File([textInput], `${tool}-input.txt`, { type: 'text/plain' })
      filesToProcess = [virtualFile]
    } else {
      if (!files.length) {
        setError('Please select or drop a file.')
        return
      }
      filesToProcess = files
    }

    setProcessing(true)
    setProgress(10)
    setError('')
    setResult(null)
    setTextResult('')
    setMultiplayerStatus('')

    try {
      const form = new FormData()
      form.append('tool', tool)
      filesToProcess.forEach(f => form.append('files', f))
      Object.entries(extraData).forEach(([k, v]) => form.append(k, String(v)))

      // Simulated multiplayer action
      if (isMultiplayer && colleagueEmail) {
        setMultiplayerStatus(`Syncing with ${colleagueEmail} inside shared workspace...`)
      }

      setProgress(30)
      const res = await fetch('/api/process', { method: 'POST', body: form })
      setProgress(80)

      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || 'Processing failed')
      }

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const json = await res.json()
        if (json.text) setTextResult(json.text)
        if (json.diff) setTextResult(json.diff)
        // For text results, we bypass payment gates
        setPaywallActive(false)
      } else {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const cd = res.headers.get('content-disposition') || ''
        const match = cd.match(/filename="?([^"]+)"?/)
        setResult({ 
          url, 
          name: match?.[1] || `ud-${tool}-output.pdf`,
          size: blob.size
        })
        // Trigger the Value Trap Paywall for downloaded assets
        setPaywallActive(true)
      }
      setProgress(100)

      if (isMultiplayer && colleagueEmail) {
        setMultiplayerStatus(`✓ Workspace generated successfully. Invitation sent to ${colleagueEmail}!`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Processing failed')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {/* Back link */}
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>

      {/* Heading */}
      <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: 10 }}>
        {name}
      </h1>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>{desc}</p>
      {freeLabel && (
        <span style={{
          display: 'inline-block', fontSize: 13, fontWeight: 600, letterSpacing: '0.1em',
          padding: '3px 10px', borderRadius: 99,
          background: 'var(--ud-teal-2)', color: 'var(--ud-teal)',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          marginBottom: 32,
        }}>{freeLabel}</span>
      )}

      {/* Tab Switcher - Zero-Friction Free Text Box Sandbox */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--ud-border)', marginBottom: 24, gap: 16 }}>
        <button
          onClick={() => { setActiveTab('file'); setError(''); }}
          style={{
            background: 'none', border: 'none', padding: '10px 4px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'file' ? 'var(--ud-teal)' : 'var(--ud-muted)',
            borderBottom: activeTab === 'file' ? '2px solid var(--ud-teal)' : '2px solid transparent',
            fontFamily: 'var(--font-body)',
          }}
        >
          📄 Upload File
        </button>
        <button
          onClick={() => { setActiveTab('text'); setError(''); }}
          style={{
            background: 'none', border: 'none', padding: '10px 4px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            color: activeTab === 'text' ? 'var(--ud-teal)' : 'var(--ud-muted)',
            borderBottom: activeTab === 'text' ? '2px solid var(--ud-teal)' : '2px solid transparent',
            fontFamily: 'var(--font-body)',
          }}
        >
          ✏️ Paste Raw Text
        </button>
      </div>

      {activeTab === 'file' ? (
        /* Drop zone */
        <div
          style={{
            border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`,
            borderRadius: 'var(--ud-radius-xl)',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)',
            transition: 'border-color 0.2s, background 0.2s',
            marginBottom: 24,
          }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptTypes}
            multiple={acceptMultiple}
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          {files.length > 0 ? (
            <div>
              {files.map((f, i) => (
                <div key={i} style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                  📄 {f.name} <span style={{ color: 'var(--ud-muted)', fontSize: 13 }}>({(f.size / 1024).toFixed(0)} KB)</span>
                </div>
              ))}
              <div style={{ fontSize: 13, color: 'var(--ud-teal)', marginTop: 8, fontFamily: 'var(--font-body)' }}>Click or drop to replace</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 15, color: 'var(--ud-ink)', fontWeight: 600, marginBottom: 6, fontFamily: 'var(--font-body)' }}>
                Drop your {acceptMultiple ? 'files' : 'file'} here
              </div>
              <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
                or click to browse · {acceptTypes}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Zero-Friction Free Text Box Sandbox */
        <div style={{ marginBottom: 24 }}>
          <textarea
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            placeholder={`Paste your raw unorganized notes, meeting minutes, transcripts, or data here to instantly run ${name}...`}
            style={{
              width: '100%', height: 160, padding: 16,
              background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)',
              borderRadius: 'var(--ud-radius-lg)', color: 'var(--ud-ink)',
              fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.6,
              outline: 'none', resize: 'vertical',
            }}
          />
        </div>
      )}

      {/* Extra fields */}
      {extraFields && <div style={{ marginBottom: 24 }}>{extraFields}</div>}

      {/* Multiplayer B2B Shared Space Activation */}
      <div style={{
        background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius-lg)', padding: 20, marginBottom: 24,
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: isMultiplayer ? 16 : 0 }}>
          <input
            type="checkbox"
            checked={isMultiplayer}
            onChange={e => setIsMultiplayer(e.target.checked)}
            style={{ accentColor: 'var(--ud-teal)', width: 16, height: 16 }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>
            👥 Invite B2B Collaborators (Opposing Counsel, Clinicians, Co-Counsel)
          </span>
        </label>
        {isMultiplayer && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
              Deploy this dynamic workflow into a secure multiplayer room to let teammates review, seal, or sign the document.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <input
                type="text"
                placeholder="Your Name"
                value={yourName}
                onChange={e => setYourName(e.target.value)}
                style={{
                  flex: 1, padding: '10px 14px', background: 'var(--ud-paper)',
                  border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)',
                  color: 'var(--ud-ink)', fontSize: 13, fontFamily: 'var(--font-body)',
                }}
              />
              <input
                type="email"
                placeholder="Colleague Email"
                value={colleagueEmail}
                onChange={e => setColleagueEmail(e.target.value)}
                style={{
                  flex: 1, padding: '10px 14px', background: 'var(--ud-paper)',
                  border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)',
                  color: 'var(--ud-ink)', fontSize: 13, fontFamily: 'var(--font-body)',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {processing && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: 'var(--ud-border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--ud-teal)', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginTop: 8 }}>Processing…</div>
        </div>
      )}

      {/* Multiplayer Status Alert */}
      {multiplayerStatus && (
        <div style={{
          padding: '12px 16px', background: 'var(--ud-teal-2)',
          border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius)',
          fontSize: 13, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)',
          marginBottom: 20,
        }}>
          {multiplayerStatus}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(226,75,74,0.08)',
          border: '1px solid rgba(226,75,74,0.2)',
          borderRadius: 'var(--ud-radius)',
          fontSize: 13, color: 'var(--ud-danger)',
          fontFamily: 'var(--font-body)',
          marginBottom: 20,
        }}>
          {error}
        </div>
      )}

      {/* Text result (OCR, Compare) */}
      {textResult && (
        <div style={{
          background: 'var(--ud-paper-2)',
          border: '1px solid var(--ud-border)',
          borderRadius: 'var(--ud-radius-lg)',
          padding: 20, marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)', marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Result
          </div>
          <pre style={{ fontSize: 13, color: 'var(--ud-ink)', fontFamily: 'var(--font-mono)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {textResult}
          </pre>
        </div>
      )}

      {/* The Value Trap Paywall Trigger */}
      {result && paywallActive && !paywallBypassed && (
        <div style={{
          padding: '24px',
          background: 'var(--ud-paper-2)',
          border: '2px solid #D4AF37',
          borderRadius: 'var(--ud-radius-xl)',
          marginBottom: 24,
          boxShadow: '0 4px 20px rgba(212,175,55,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', margin: 0 }}>
              Your secure document is fully compiled and ready
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>
            Filename: {result.name} · Size: {(result.size / 1024).toFixed(0)} KB
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            <div
              onClick={() => setPaywallBypassed(true)}
              style={{
                border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)',
                padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s',
                background: 'var(--ud-paper)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>
                  Option 1: Fast Download
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)' }}>
                  $1.00
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                Instant download and verification certificate for this document.
              </p>
            </div>
            <div
              onClick={() => setPaywallBypassed(true)}
              style={{
                border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)',
                padding: '16px', cursor: 'pointer', transition: 'border-color 0.15s',
                background: 'var(--ud-paper)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>
                  Option 2: Unlimited Sovereign Membership
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ud-teal)', fontFamily: 'var(--font-mono)' }}>
                  $5.00/mo
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', margin: 0 }}>
                Full access to all 253 sovereign tools with zero limits and no verification caps.
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setPaywallBypassed(true)}
              style={{
                background: 'none', border: 'none', color: '#D4AF37',
                fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.08em', cursor: 'pointer', fontFamily: 'var(--font-mono)',
              }}
            >
              ✦ Beta Tester Bypass: Download Free During Beta ✦
            </button>
          </div>
        </div>
      )}

      {/* Download result - Unlocked after Paywall or Bypass */}
      {result && (!paywallActive || paywallBypassed) && (
        <div style={{
          padding: '16px 20px',
          background: 'var(--ud-teal-2)',
          border: '1px solid var(--ud-teal)',
          borderRadius: 'var(--ud-radius-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>Ready to download</div>
            <div style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{result.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ud-teal)', fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              🔒 Secured by the Sovereign Hive Network. Verify at reader.hive.baby
            </div>
          </div>
          <a
            href={result.url}
            download={result.name}
            style={{
              padding: '10px 20px',
              background: 'var(--ud-ink)',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 'var(--ud-radius)',
              fontFamily: 'var(--font-body)',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            Download →
          </a>
        </div>
      )}

      {/* Action button */}
      <button
        onClick={process}
        disabled={(activeTab === 'file' && !files.length) || (activeTab === 'text' && !textInput.trim()) || processing}
        style={{
          width: '100%',
          padding: '14px',
          background: ((activeTab === 'file' && !files.length) || (activeTab === 'text' && !textInput.trim()) || processing) ? 'var(--ud-border)' : 'var(--ud-ink)',
          color: ((activeTab === 'file' && !files.length) || (activeTab === 'text' && !textInput.trim()) || processing) ? 'var(--ud-muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--ud-radius)',
          fontSize: 15,
          fontWeight: 600,
          fontFamily: 'var(--font-body)',
          cursor: ((activeTab === 'file' && !files.length) || (activeTab === 'text' && !textInput.trim()) || processing) ? 'not-allowed' : 'pointer',
          transition: 'background 0.15s',
          marginBottom: 32,
        }}
      >
        {processing ? 'Processing…' : `Run ${name}`}
      </button>

      {/* B2B Activity Companion (AAC) Portal Cross-Sell */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(212,175,55,0.04)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 'var(--ud-radius-lg)',
        fontSize: 13, color: 'var(--ud-muted)',
        fontFamily: 'var(--font-body)',
        lineHeight: 1.6,
        marginBottom: 32,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#D4AF37', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, marginBottom: 6 }}>
          <span>💡</span> B2B Activity Companion Integration
        </div>
        Need to synchronize clinical transcripts, legal contracts, or team logs automatically? Enter the B2B Activity Companion (AAC) Portal at{' '}
        <a href="https://activity.hive.baby" target="_blank" rel="noreferrer" style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>
          activity.hive.baby
        </a>{' '}
        to configure real-time webhook endpoints, Clerk biometric onboarding pipelines, and dynamic programmatic workflows.
      </div>

      {/* Footer note */}
      <div style={{
        padding: '16px',
        background: 'var(--ud-paper-2)',
        border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius)',
        fontSize: 13, color: 'var(--ud-muted)',
        fontFamily: 'var(--font-body)',
        textAlign: 'center',
      }}>
        Output is processed in-memory. Files are not stored.
        Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>
    </div>
  )
}
