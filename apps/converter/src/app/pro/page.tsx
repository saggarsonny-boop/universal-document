'use client'
import { useState, useEffect } from 'react'

interface ProState {
  email: string | null
  active: boolean
  keyPrefix: string | null
  newKey: string | null
  loading: boolean
  error: string
}

const C = {
  page: { minHeight: '100vh', background: '#f9fafb', padding: '56px 24px 80px' } as React.CSSProperties,
  wrap: { maxWidth: 560, margin: '0 auto' } as React.CSSProperties,
  back: { fontSize: 13, color: '#6b7280', display: 'block', marginBottom: 32 } as React.CSSProperties,
  h1: { fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 } as React.CSSProperties,
  sub: { fontSize: 14, color: '#6b7280', marginBottom: 40 } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px', marginBottom: 20 } as React.CSSProperties,
  cardTitle: { fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 16, textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
  keyBox: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontFamily: 'monospace', fontSize: 14, color: '#111827', wordBreak: 'break-all' as const, marginBottom: 12 },
  btn: { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginRight: 8 } as React.CSSProperties,
  secondaryBtn: { background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' } as React.CSSProperties,
  input: { width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 14, outline: 'none', marginBottom: 12 } as React.CSSProperties,
  label: { fontSize: 13, color: '#374151', fontWeight: 500, display: 'block', marginBottom: 6 },
  codeBlock: { background: '#1e293b', color: '#e2e8f0', borderRadius: 8, padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, overflow: 'auto', marginBottom: 12 } as React.CSSProperties,
  warning: { fontSize: 12, color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 6, padding: '8px 12px', marginBottom: 12 } as React.CSSProperties,
}

export default function ProPage() {
  const [state, setState] = useState<ProState>({
    email: null, active: false, keyPrefix: null, newKey: null, loading: true, error: '',
  })
  const [emailInput, setEmailInput] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const storedEmail = localStorage.getItem('converter_pro_email')

    if (sessionId) {
      fetch(`/api/pro-session?id=${sessionId}`)
        .then(r => r.json())
        .then(data => {
          if (data.email) {
            localStorage.setItem('converter_pro_email', data.email)
            localStorage.setItem('converter_api_key', '') // clear any old key
            setState({ email: data.email, active: data.active, keyPrefix: data.keyPrefix, newKey: null, loading: false, error: '' })
          } else {
            setState(s => ({ ...s, loading: false, error: data.error || 'Failed to verify subscription' }))
          }
        })
        .catch(() => setState(s => ({ ...s, loading: false, error: 'Failed to verify subscription' })))
    } else if (storedEmail) {
      setState({ email: storedEmail, active: true, keyPrefix: null, newKey: null, loading: false, error: '' })
    } else {
      setState(s => ({ ...s, loading: false }))
    }
  }, [])

  async function generateKey() {
    if (!state.email) return
    setGenerating(true)
    try {
      const res = await fetch('/api/api-key', {
        method: 'POST',
        headers: { 'x-pro-email': state.email },
      })
      const data = await res.json()
      if (data.key) {
        localStorage.setItem('converter_api_key', data.key)
        setState(s => ({ ...s, newKey: data.key, keyPrefix: data.prefix }))
      } else {
        alert(data.error || 'Failed to generate key')
      }
    } finally {
      setGenerating(false)
    }
  }

  async function copyKey() {
    const key = state.newKey ?? localStorage.getItem('converter_api_key')
    if (key) {
      await navigator.clipboard.writeText(key)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function lookupByEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!emailInput) return
    localStorage.setItem('converter_pro_email', emailInput)
    setState(s => ({ ...s, email: emailInput, active: true, loading: false }))
  }

  if (state.loading) {
    return (
      <div style={C.page}>
        <div style={{ ...C.wrap, textAlign: 'center', paddingTop: 100 }}>
          <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    )
  }

  if (!state.email) {
    return (
      <div style={C.page}>
        <div style={C.wrap}>
          <a href="/" style={C.back}>← Converter</a>
          <h1 style={C.h1}>Pro Dashboard</h1>
          <p style={C.sub}>Enter the email you used to subscribe.</p>
          <div style={C.card}>
            <form onSubmit={lookupByEmail}>
              <label style={C.label}>Subscription email</label>
              <input style={C.input} type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="you@example.com" required />
              <button type="submit" style={C.btn}>Access Pro</button>
            </form>
            <p style={{ marginTop: 16, fontSize: 13, color: '#9ca3af' }}>
              Not subscribed yet? <a href="/pricing" style={{ color: '#2563eb' }}>View pricing →</a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('converter_api_key') : null
  const displayKey = state.newKey ?? storedKey

  return (
    <div style={C.page}>
      <div style={C.wrap}>
        <a href="/" style={C.back}>← Converter</a>
        <h1 style={C.h1}>Pro Dashboard</h1>
        <p style={C.sub}>{state.email} · <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span></p>

        <div style={C.card}>
          <div style={C.cardTitle}>API Key</div>
          {displayKey ? (
            <>
              {state.newKey && (
                <div style={C.warning}>
                  ⚠ Copy this key now — it won&apos;t be shown again after you leave this page.
                </div>
              )}
              <div style={C.keyBox}>{displayKey}</div>
              <button style={C.btn} onClick={copyKey}>{copied ? 'Copied!' : 'Copy key'}</button>
              <button style={C.secondaryBtn} onClick={generateKey} disabled={generating}>
                {generating ? 'Generating…' : 'Regenerate key'}
              </button>
            </>
          ) : state.keyPrefix ? (
            <>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>Key prefix: <code style={{ fontFamily: 'monospace' }}>{state.keyPrefix}…</code></p>
              <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>Full key not shown — regenerate to get a new one.</p>
              <button style={C.btn} onClick={generateKey} disabled={generating}>{generating ? 'Generating…' : 'Generate new key'}</button>
            </>
          ) : (
            <>
              <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>No API key yet. Generate one to start using the Pro API.</p>
              <button style={C.btn} onClick={generateKey} disabled={generating}>{generating ? 'Generating…' : 'Generate API key'}</button>
            </>
          )}
        </div>

        <div style={C.card}>
          <div style={C.cardTitle}>API Usage</div>
          <p style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>Single file conversion:</p>
          <div style={C.codeBlock}>{`curl -X POST https://converter.hive.baby/api/convert \\
  -H "X-API-Key: your_key_here" \\
  -F "file=@document.docx" \\
  --output document.uds`}</div>

          <p style={{ fontSize: 14, color: '#374151', marginBottom: 16, marginTop: 20 }}>Batch conversion (ZIP → ZIP):</p>
          <div style={C.codeBlock}>{`curl -X POST https://converter.hive.baby/api/batch \\
  -H "X-API-Key: your_key_here" \\
  -F "archive=@documents.zip" \\
  --output converted.zip`}</div>
        </div>

        <div style={C.card}>
          <div style={C.cardTitle}>Subscription</div>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 16 }}>Manage billing, update payment method, or cancel.</p>
          <a href="https://billing.stripe.com/p/login/test_placeholder" target="_blank" rel="noopener noreferrer" style={{ ...C.secondaryBtn, display: 'inline-block', textDecoration: 'none' }}>
            Manage billing →
          </a>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            style={{ background: 'none', border: 'none', fontSize: 13, color: '#9ca3af', cursor: 'pointer' }}
            onClick={() => { localStorage.removeItem('converter_pro_email'); window.location.reload() }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
