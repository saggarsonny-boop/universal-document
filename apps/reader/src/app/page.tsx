'use client'

import { useState, useCallback } from 'react'
import UDOnboarding from '@/components/UDOnboarding'
import type { UDDocument } from '@/lib/types'
import { validateUDDocument } from '@/lib/validator'
import DocumentViewer from '@/components/DocumentViewer'

type AppState = 'landing' | 'loading' | 'error' | 'viewing'

export default function Home() {
  const [appState, setAppState] = useState<AppState>('landing')
  const [doc, setDoc] = useState<UDDocument | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  function handleParsed(raw: unknown) {
    const result = validateUDDocument(raw)
    if (!result.valid) {
      setErrors(result.errors)
      setAppState('error')
      return
    }
    setDoc(raw as UDDocument)
    setAppState('viewing')
  }

  function handleFile(file: File) {
    if (!file.name.endsWith('.uds') && !file.name.endsWith('.udr') && !file.name.endsWith('.json')) {
      setErrors(['File must be a .uds, .udr, or .json file.'])
      setAppState('error')
      return
    }
    setAppState('loading')
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        handleParsed(parsed)
      } catch {
        setErrors(['Could not parse file. Make sure it is a valid UD document.'])
        setAppState('error')
      }
    }
    reader.readAsText(file)
  }

  async function handleURL() {
    if (!urlInput.trim()) return
    setAppState('loading')
    try {
      const res = await fetch(urlInput.trim())
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const parsed = await res.json()
      handleParsed(parsed)
    } catch (e) {
      setErrors([`Could not load document from URL. ${e instanceof Error ? e.message : ''}`])
      setAppState('error')
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  function reset() {
    setAppState('landing')
    setDoc(null)
    setErrors([])
    setUrlInput('')
  }

  if (appState === 'viewing' && doc) {
    return (
      <div>
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid var(--ud-border)',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>
            UD Reader
          </span>
          <button
            onClick={reset}
            style={{
              background: 'none',
              border: '1px solid var(--ud-border)',
              borderRadius: '0.5rem',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              color: 'var(--ud-muted)',
            }}
          >
            Open another document
          </button>
        </div>
        <DocumentViewer doc={doc} />
      </div>
    )
  }

  if (appState === 'loading') {
    return (
      <div style={centeredPage}>
        <div style={{ fontSize: '1rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>Loading document...</div>
      </div>
    )
  }

  if (appState === 'error') {
    return (
      <div style={centeredPage}>
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          maxWidth: '520px',
          width: '100%',
        }}>
          <div style={{ fontWeight: 700, color: '#dc2626', marginBottom: '0.75rem', fontFamily: 'var(--font-body)' }}>
            Invalid Document
          </div>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: '0.35rem', fontFamily: 'var(--font-mono)' }}>
              {e}
            </div>
          ))}
          <button onClick={reset} style={primaryButton}>
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={centeredPage}>
      <UDOnboarding engine="Reader" />
      <div style={{ maxWidth: '560px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>
            UD Reader
          </h1>
          <p style={{ color: 'var(--ud-muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)' }}>
            Open any Universal Document™ file. Free forever.
          </p>
          <p style={{ color: 'var(--ud-muted)', fontSize: '0.82rem', marginTop: '0.6rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
            Lifecycle: legacy file → converter → UDS → reader clarity → UDR editing → UDS export.
            UDR appears with light blue identity. UDS appears with dark blue identity.
          </p>
          <p style={{ color: 'var(--ud-muted)', fontSize: '0.78rem', marginTop: '0.45rem', lineHeight: 1.6, fontFamily: 'var(--font-body)' }}>
            Reader surfaces clarity layers, semantic sections, metadata, multilingual ribbons, permissions, and chain-of-custody as read-only.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          style={{
            border: `2px dashed ${isDragging ? 'var(--ud-teal)' : 'var(--ud-border)'}`,
            borderRadius: '1rem',
            padding: '2.5rem',
            textAlign: 'center',
            background: isDragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)',
            transition: 'all 0.2s',
            marginBottom: '1.5rem',
            cursor: 'pointer',
          }}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⬆️</div>
          <div style={{ fontWeight: 600, color: 'var(--ud-ink)', marginBottom: '0.35rem', fontFamily: 'var(--font-body)' }}>
            Drop a .uds or .udr file here
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>
            or click to browse
          </div>
          <input
            id="fileInput"
            type="file"
            accept=".uds,.udr,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--ud-border)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>or load from URL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--ud-border)' }} />
        </div>

        {/* URL input */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="url"
            placeholder="https://example.com/document.uds"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleURL() }}
            style={{
              flex: 1,
              padding: '0.65rem 1rem',
              border: '1px solid var(--ud-border)',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              outline: 'none',
              color: 'var(--ud-ink)',
              background: '#ffffff',
              fontFamily: 'var(--font-body)',
            }}
          />
          <button onClick={handleURL} style={primaryButton}>
            Load
          </button>
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)' }}>
          Universal Document™ · iSDF v0.1.0 · The Hive Engines · Free forever
        </div>

      </div>
    </div>
  )
}

const centeredPage: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: 'var(--ud-paper)',
}

const primaryButton: React.CSSProperties = {
  background: 'var(--ud-ink)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '0.5rem',
  padding: '0.65rem 1.25rem',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: '1rem',
  fontFamily: 'var(--font-body)',
}
