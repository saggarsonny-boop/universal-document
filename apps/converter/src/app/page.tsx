'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import AutoDemo from './components/AutoDemo'
import FirstVisitCard from './components/FirstVisitCard'
import TooltipTour from './components/TooltipTour'
import UDOnboarding from '@/components/UDOnboarding'

type ConvertState = 'idle' | 'converting' | 'done' | 'error'

const ACCEPTED = '.pdf,.docx,.txt,.md,.csv,.html,.png,.jpg,.jpeg,.webp,.gif'
const ACCEPTED_LABEL = 'PDF, DOCX, TXT, CSV, HTML, images'
const FREE_LIMIT = 5

const UTILITY_OPTIONS = [
  { id: 'merge', label: 'UD Merge' },
  { id: 'split', label: 'UD Split' },
  { id: 'compress', label: 'UD Compress' },
  { id: 'extract-pages', label: 'UD Extract Pages' },
  { id: 'rearrange-pages', label: 'UD Rearrange Pages' },
  { id: 'protect', label: 'UD Protect' },
  { id: 'unlock', label: 'UD Unlock' },
  { id: 'ocr', label: 'UD OCR' },
  { id: 'watermark', label: 'UD Watermark' },
  { id: 'page-numbers', label: 'UD Page Numbers' },
  { id: 'compare', label: 'UD Compare' },
  { id: 'redact', label: 'UD Redact' },
  { id: 'optimize', label: 'UD Optimize' },
] as const

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getUsage(): number {
  if (typeof window === 'undefined') return 0
  const day = localStorage.getItem('converter_day')
  if (day !== getTodayKey()) return 0
  return Number(localStorage.getItem('converter_count') ?? '0')
}

function incrementUsage() {
  localStorage.setItem('converter_day', getTodayKey())
  const next = getUsage() + 1
  localStorage.setItem('converter_count', String(next))
  return next
}

export default function ConverterPage() {
  const [state, setState] = useState<ConvertState>('idle')
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [outputName, setOutputName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [usage, setUsage] = useState(0)
  const [isPro, setIsPro] = useState(false)
  const [utility, setUtility] = useState<(typeof UTILITY_OPTIONS)[number]['id']>('optimize')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setUsage(getUsage())
    const storedEmail = localStorage.getItem('converter_pro_email')
    setIsPro(!!storedEmail)
  }, [])

  async function convert(file: File) {
    setFileName(file.name)
    setState('converting')
    setError('')

    const form = new FormData()
    form.append('file', file)
    form.append('utility', utility)

    const headers: Record<string, string> = {}
    const apiKey = localStorage.getItem('converter_api_key')
    if (apiKey) headers['X-API-Key'] = apiKey

    try {
      const res = await fetch('/api/convert', { method: 'POST', body: form, headers })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (res.status === 429) {
          setError(`Free tier: ${FREE_LIMIT} files per day reached.`)
          setState('error')
          return
        }
        throw new Error(data.error || 'Conversion failed')
      }

      const blob = await res.blob()
      const disp = res.headers.get('Content-Disposition') ?? ''
      const match = disp.match(/filename="([^"]+)"/)
      const name = match?.[1] ?? file.name.replace(/\.[^.]+$/, '.uds')
      setOutputName(name)

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)

      if (!isPro) {
        const next = incrementUsage()
        setUsage(next)
      }
      setState('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Conversion failed')
      setState('error')
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) convert(file)
  }, [isPro]) // eslint-disable-line react-hooks/exhaustive-deps

  function reset() {
    setState('idle')
    setError('')
    setFileName('')
    setOutputName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const atLimit = !isPro && usage >= FREE_LIMIT

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '64px 24px 40px' }}>
      <UDOnboarding engine="Converter" />
      <AutoDemo />
      <FirstVisitCard />
      <TooltipTour engineId="udconverter" tips={[
        { label: "Upload or drag", text: "Drop PDF, DOCX, TXT, CSV, HTML, or images — then normalize to UDS." },
        { label: "Free tier", text: "5 free conversions per day, no account needed. The count resets at midnight." },
        { label: "UD utilities", text: "Use Merge, Split, OCR, Redact, Optimize and more before conversion." },
        { label: "Download", text: "Output is a UDS file with sealed visual identity and metadata links." },
      ]} />

      <div style={{ marginBottom: 48, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          <a href="https://ud.hive.baby" style={{ fontSize: 13, color: '#6b7280' }}>← UD Hub</a>
          <span style={{ color: '#d1d5db' }}>·</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>Converter</span>
          <span style={{ color: '#d1d5db' }}>·</span>
          <a href="/pricing" style={{ fontSize: 13, color: '#2563eb' }}>Pricing</a>
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827', marginBottom: 12 }}>
          Convert to Universal Document
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', maxWidth: 440, margin: '0 auto', lineHeight: 1.6 }}>
          Upload a {ACCEPTED_LABEL} file. Pick a UD utility, then download a normalized <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, fontSize: 13 }}>.uds</code> file ready for UD Reader.
        </p>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>
          <label style={{ fontSize: 12, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 8 }}>
            Utility
            <select
              value={utility}
              onChange={(e) => setUtility(e.target.value as (typeof UTILITY_OPTIONS)[number]['id'])}
              style={{ border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 10px', fontSize: 12, color: '#111827', background: '#fff' }}
            >
              {UTILITY_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {!isPro && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: atLimit ? '#fef2f2' : '#f3f4f6', border: `1px solid ${atLimit ? '#fecaca' : '#e5e7eb'}`, borderRadius: 20, padding: '6px 14px' }}>
            <span style={{ fontSize: 12, color: atLimit ? '#dc2626' : '#6b7280' }}>
              {usage}/{FREE_LIMIT} free conversions today
            </span>
            {atLimit && (
              <a href="/pricing" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb' }}>Upgrade →</a>
            )}
          </div>
        )}

        {isPro && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 20, padding: '6px 14px' }}>
            <span style={{ fontSize: 12, color: '#2563eb', fontWeight: 600 }}>⚡ Pro — unlimited</span>
            <a href="/pro" style={{ fontSize: 12, color: '#6b7280' }}>Manage →</a>
          </div>
        )}
      </div>

      {atLimit && state === 'idle' ? (
        <div style={{ border: '1px solid #fecaca', borderRadius: 16, padding: '48px 32px', textAlign: 'center', background: '#fef2f2' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Daily limit reached</p>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Free tier: {FREE_LIMIT} conversions per day. Resets at midnight.</p>
          <a href="/pricing" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', borderRadius: 8, padding: '12px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            Upgrade to Pro — $29/month
          </a>
        </div>
      ) : state === 'idle' || state === 'error' ? (
        <>
          <div
            onDrop={onDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? '#2563eb' : '#d1d5db'}`,
              borderRadius: 16,
              padding: '56px 32px',
              textAlign: 'center',
              cursor: 'pointer',
              background: isDragging ? '#eff6ff' : '#ffffff',
              transition: 'all 0.15s',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Drop your file here
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>
              or click to browse · {ACCEPTED_LABEL} supported · max {isPro ? '50' : '10'} MB
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <div style={{ textAlign: 'center' as const }}>
                <svg width="36" height="45" viewBox="0 0 64 80" xmlns="http://www.w3.org/2000/svg">
                  <rect x="0" y="0" width="64" height="80" rx="6" fill="#f0f4f8" stroke="#d0dde8" strokeWidth="1"/>
                  <rect x="8" y="12" width="32" height="4" rx="2" fill="#c0cdd8"/>
                  <rect x="8" y="22" width="40" height="3" rx="1.5" fill="#d0dde8"/>
                  <rect x="8" y="30" width="36" height="3" rx="1.5" fill="#d0dde8"/>
                  <rect x="8" y="38" width="28" height="3" rx="1.5" fill="#d0dde8"/>
                  <rect x="0" y="56" width="64" height="24" rx="6" fill="#1e2d3d"/>
                  <rect x="0" y="56" width="64" height="10" fill="#1e2d3d"/>
                  <text x="32" y="72" textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="700" fontSize="10" fill="#ffffff">.uds</text>
                </svg>
                <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 4 }}>output</div>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED}
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) convert(f); e.target.value = '' }}
            />
          </div>

          {state === 'error' && (
            <div style={{ marginTop: 16, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 16px', fontSize: 14 }}>
              <span style={{ color: '#dc2626' }}>{error}</span>
              {error.includes('limit') && (
                <a href="/pricing" style={{ marginLeft: 12, color: '#2563eb', fontSize: 13, fontWeight: 600 }}>Upgrade to Pro →</a>
              )}
              <button onClick={reset} style={{ marginLeft: 12, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>Try again</button>
            </div>
          )}
        </>
      ) : state === 'converting' ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: '56px 32px', textAlign: 'center', background: '#fff' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
          <p style={{ fontSize: 15, color: '#374151', fontWeight: 500 }}>Converting {fileName}…</p>
          <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 6 }}>This usually takes a second or two.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : (
        <div style={{ border: '1px solid #d1fae5', borderRadius: 16, padding: '48px 32px', textAlign: 'center', background: '#f0fdf4' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#065f46', marginBottom: 6 }}>Converted successfully</p>
          <p style={{ fontSize: 14, color: '#047857', marginBottom: 8 }}>{outputName} downloaded to your device.</p>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 28 }}>
            Open it in the{' '}
            <a href="https://ud.hive.baby" style={{ color: '#2563eb' }}>UD Reader</a>.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <a
              href="https://ud.hive.baby"
              style={{ background: 'var(--ud-ink)', color: '#fff', border: 'none', borderRadius: 99, padding: '10px 22px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >Open in UD Reader →</a>
            <a
              href="https://validator.hive.baby"
              style={{ background: 'transparent', color: 'var(--ud-ink)', border: '1px solid var(--ud-border)', borderRadius: 99, padding: '10px 22px', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
            >Validate this file →</a>
          </div>
          <button
            onClick={reset}
            style={{ background: 'none', color: 'var(--ud-muted)', border: 'none', fontSize: 13, cursor: 'pointer', textDecoration: 'underline', marginTop: 8 }}
          >
            Convert another file
          </button>
        </div>
      )}

      {!isPro && (
        <div style={{ marginTop: 28, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>Need more?</p>
            <p style={{ fontSize: 13, color: '#b45309' }}>Unlimited files · Batch ZIP · API access · Chain of custody</p>
          </div>
          <a href="/pricing" style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Pro — $29/mo →
          </a>
        </div>
      )}

      <div style={{ marginTop: 48, borderTop: '1px solid #f3f4f6', paddingTop: 24, textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#d1d5db', marginBottom: 12, letterSpacing: '0.05em' }}>
          NO ADS · NO INVESTORS · NO AGENDA
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['UD Hub', 'https://ud.hive.baby'],
            ['Pricing', '/pricing'],
            ['Pro', '/pro'],
            ['hive.baby', 'https://hive.baby'],
          ].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: 12, color: '#9ca3af' }}>{label}</a>
          ))}
        </div>
      </div>
    </main>
  )
}
