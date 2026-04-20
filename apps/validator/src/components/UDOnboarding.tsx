'use client'
import { useState, useEffect, useCallback } from 'react'

interface Step {
  icon: string
  iconAnim?: string
  title: string
  body: string
}

const STEPS: Record<string, Step[]> = {
  Converter: [
    { icon: '📄', iconAnim: 'ud-bounce', title: 'Convert any document', body: 'Turn PDF, DOCX, TXT, or MD into a Universal Document (.uds) file.' },
    { icon: '⬆️', iconAnim: 'ud-rise', title: 'Drag or click to upload', body: 'Drop your file anywhere on the page — conversion happens instantly in your browser.' },
    { icon: '🆓', title: 'Free forever', body: 'Up to 5 files per day, free. No account needed.' },
  ],
  Reader: [
    { icon: '📖', iconAnim: 'ud-bounce', title: 'Open any Universal Document', body: 'UD Reader opens .uds and .udr files directly in your browser.' },
    { icon: '🖱️', iconAnim: 'ud-rise', title: 'Drag a file here, or paste a URL', body: 'No upload required — your document stays on your device.' },
    { icon: '🌍', title: 'Opens in your language', body: 'Multilingual documents adapt automatically to your locale.' },
  ],
  Creator: [
    { icon: '✏️', iconAnim: 'ud-bounce', title: 'Create Universal Documents', body: 'Write structured documents from scratch with the block editor.' },
    { icon: '⬛', iconAnim: 'ud-rise', title: 'Blocks: headings, paragraphs, lists', body: 'Click + to add a block. Press Enter to continue. Bold, italic, and links supported.' },
    { icon: '⬇️', title: 'Export as .uds', body: 'Download your document — it opens in any UD Reader, forever.' },
  ],
  Validator: [
    { icon: '✅', iconAnim: 'ud-bounce', title: 'Verify any Universal Document', body: 'Drop a .uds file to instantly check its structure and integrity.' },
    { icon: '🔍', iconAnim: 'ud-rise', title: 'Schema, expiry, signature', body: 'See encryption status, expiry date, signature, and schema version at a glance.' },
    { icon: '🛡️', title: 'Know your document is genuine', body: 'Validation confirms the file is well-formed and unmodified.' },
  ],
}

const CTA: Record<string, string> = {
  Converter: 'Convert a file →',
  Reader: 'Open a file →',
  Creator: 'Start writing →',
  Validator: 'Validate a file →',
}

export default function UDOnboarding({ engine }: { engine: string }) {
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [fading, setFading] = useState(false)
  const steps = STEPS[engine] ?? []
  const key = `ud-${engine.toLowerCase()}-onboarded`

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [key])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') dismiss()
    }
    if (visible) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      setFading(false)
      localStorage.setItem(key, '1')
    }, 300)
  }, [key])

  if (!visible) return null

  const current = steps[step]

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(30,45,61,0.82)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 16,
          maxWidth: 480,
          width: '100%',
          padding: '2rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'ud-fade-in 0.3s ease',
        }}
      >
        {/* Step icon */}
        <div style={{
          fontSize: 48, textAlign: 'center', marginBottom: 16,
          animation: current.iconAnim ? `${current.iconAnim} 0.6s ease` : undefined,
        }}>
          {current.icon}
        </div>

        {/* Step text */}
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22,
          color: 'var(--ud-ink)', textAlign: 'center', marginBottom: 10,
          animation: 'ud-fade-in 0.3s ease',
        }}>{current.title}</h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-muted)',
          textAlign: 'center', lineHeight: 1.6, marginBottom: 28,
          animation: 'ud-fade-in 0.3s ease',
        }}>{current.body}</p>

        {/* Dot indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {steps.map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i === step ? 'var(--ud-ink)' : 'var(--ud-border)',
              transition: 'background 0.2s',
              cursor: 'pointer',
            }} onClick={e => { e.stopPropagation(); setStep(i) }} />
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {step < steps.length - 1 ? (
            <>
              <button onClick={dismiss} style={{
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                padding: '9px 20px', borderRadius: 99, border: '1px solid var(--ud-border)',
                background: 'transparent', color: 'var(--ud-muted)', cursor: 'pointer',
              }}>Skip</button>
              <button onClick={() => setStep(s => s + 1)} style={{
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
                padding: '9px 24px', borderRadius: 99, border: 'none',
                background: 'var(--ud-ink)', color: '#fff', cursor: 'pointer',
              }}>Next →</button>
            </>
          ) : (
            <button onClick={dismiss} style={{
              fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
              padding: '10px 28px', borderRadius: 99, border: 'none',
              background: 'var(--ud-ink)', color: '#fff', cursor: 'pointer',
              transform: 'translateY(0)', transition: 'transform 0.15s, box-shadow 0.15s',
              boxShadow: '0 2px 8px rgba(30,45,61,0.2)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(30,45,61,0.28)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(30,45,61,0.2)'
            }}
            >{CTA[engine] ?? 'Got it'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
