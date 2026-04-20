'use client'

import { useMemo, useState } from 'react'

interface ParsedDoc {
  state?: 'UDR' | 'UDS' | string
  metadata?: {
    id?: string
    title?: string
    revoked?: boolean
    visual_identity?: {
      watermark_tone?: 'light_blue' | 'dark_blue'
      watermark_hex?: string
      icon?: {
        desktop?: string
        finder_preview?: string
        explorer_preview?: string
        preview_pane?: string
      }
    }
  }
  manifest?: {
    signatures?: Array<{ by: string; at: string; reason?: string; hash: string }>
    revocation?: { revoked_at: string; reason: string }
  }
  blocks?: unknown[]
}

function hashText(input: string): string {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return `udsig_${(h >>> 0).toString(16).padStart(8, '0')}`
}

export default function SignerPage() {
  const [raw, setRaw] = useState('')
  const [signer, setSigner] = useState('')
  const [reason, setReason] = useState('')
  const [revocationReason, setRevocationReason] = useState('')
  const [error, setError] = useState('')

  const parsed = useMemo(() => {
    if (!raw.trim()) return null
    try {
      return JSON.parse(raw) as ParsedDoc
    } catch {
      return null
    }
  }, [raw])

  function importFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      setRaw(String(e.target?.result ?? ''))
      setError('')
    }
    reader.readAsText(file)
  }

  function signDocument() {
    if (!parsed) {
      setError('Load a valid UDR/UDS JSON document first.')
      return
    }
    if (!signer.trim()) {
      setError('Signer name/email is required.')
      return
    }

    const base = { ...parsed }
    const hash = hashText(JSON.stringify(base.blocks ?? []))
    const signatures = [...(base.manifest?.signatures ?? []), {
      by: signer.trim(),
      at: new Date().toISOString(),
      reason: reason.trim() || 'approval',
      hash,
    }]

    const sealed: ParsedDoc = {
      ...base,
      state: 'UDS',
      metadata: {
        ...base.metadata,
        visual_identity: {
          watermark_tone: 'dark_blue',
          watermark_hex: '#1d4ed8',
          icon: {
            desktop: 'uds-icon-dark-blue',
            finder_preview: 'uds-finder-dark-blue',
            explorer_preview: 'uds-explorer-dark-blue',
            preview_pane: 'uds-pane-dark-blue',
          },
        },
      },
      manifest: {
        ...base.manifest,
        signatures,
      },
    }

    const text = JSON.stringify(sealed, null, 2)
    setRaw(text)
    setError('')
    download(text, `${(sealed.metadata?.title ?? 'signed-document').toLowerCase().replace(/\s+/g, '-')}.uds`)
  }

  function revokeDocument() {
    if (!parsed) {
      setError('Load a valid UDR/UDS JSON document first.')
      return
    }

    const revoked: ParsedDoc = {
      ...parsed,
      metadata: {
        ...parsed.metadata,
        revoked: true,
      },
      manifest: {
        ...parsed.manifest,
        revocation: {
          revoked_at: new Date().toISOString(),
          reason: revocationReason.trim() || 'issuer_revoked',
        },
      },
    }

    const text = JSON.stringify(revoked, null, 2)
    setRaw(text)
    setError('')
    download(text, `${(revoked.metadata?.title ?? 'revoked-document').toLowerCase().replace(/\s+/g, '-')}.uds`)
  }

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: '64px 24px', color: '#e2e8f0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>UD Signer</h1>
      <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 22 }}>
        Seal UDR documents into UDS with deterministic identity metadata, signature hash, and revocation markers.
      </p>

      <div style={{ border: '1px solid #1e293b', borderRadius: 12, background: 'rgba(15,23,42,0.55)', padding: 16, marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#94a3b8' }}>Load UDR/UDS file</label>
        <input
          type="file"
          accept=".udr,.uds,.json"
          style={{ display: 'block', marginTop: 8, color: '#cbd5e1' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) importFile(file)
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <input
          value={signer}
          onChange={(e) => setSigner(e.target.value)}
          placeholder="Signer name or email"
          style={{ border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', background: '#0f172a', color: '#e2e8f0' }}
        />
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Signature reason (optional)"
          style={{ border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', background: '#0f172a', color: '#e2e8f0' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, marginBottom: 12 }}>
        <input
          value={revocationReason}
          onChange={(e) => setRevocationReason(e.target.value)}
          placeholder="Revocation reason (optional)"
          style={{ border: '1px solid #334155', borderRadius: 8, padding: '10px 12px', background: '#0f172a', color: '#e2e8f0' }}
        />
        <button onClick={signDocument} style={buttonStyle('#1d4ed8')}>Seal as UDS</button>
        <button onClick={revokeDocument} style={buttonStyle('#991b1b')}>Revoke</button>
      </div>

      {error && <p style={{ color: '#f87171', marginBottom: 10, fontSize: 13 }}>{error}</p>}

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste UDR/UDS JSON here"
        style={{ width: '100%', minHeight: 360, borderRadius: 10, border: '1px solid #334155', padding: '14px', background: '#020617', color: '#cbd5e1', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12 }}
      />

      {parsed?.metadata?.visual_identity && (
        <div style={{ marginTop: 16, border: '1px solid #334155', borderRadius: 10, padding: 14, background: 'rgba(2,6,23,0.6)', fontSize: 13 }}>
          <div>Watermark tone: {parsed.metadata.visual_identity.watermark_tone}</div>
          <div>Desktop icon id: {parsed.metadata.visual_identity.icon?.desktop}</div>
          <div>Finder preview id: {parsed.metadata.visual_identity.icon?.finder_preview}</div>
          <div>Explorer preview id: {parsed.metadata.visual_identity.icon?.explorer_preview}</div>
          <div>Preview pane id: {parsed.metadata.visual_identity.icon?.preview_pane}</div>
        </div>
      )}
    </main>
  )
}

function download(content: string, fileName: string) {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    border: 'none',
    borderRadius: 8,
    padding: '10px 14px',
    background: color,
    color: '#fff',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  }
}
