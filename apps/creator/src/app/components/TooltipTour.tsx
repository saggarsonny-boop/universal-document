'use client'
import { useState, useEffect } from 'react'

const GLOBAL_KEY = 'hive_ud_tour_dismissed'

const TIPS = [
  { label: 'Block types', text: 'H = heading, P = paragraph, L = list, D = divider. Click the letters to switch.' },
  { label: 'UDR vs UDS', text: 'UDR is editable (light blue identity). UDS is sealed (dark blue). Choose before export.' },
  { label: 'Cloud save', text: 'Sign in with email for magic-link auth. Documents saved to your Hive account.' },
  { label: 'Export', text: 'Downloads a .udr or .uds file. Open it in UD Reader. Lifecycle: create → seal → read.' },
]

export default function TooltipTour() {
  const [step, setStep] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && !localStorage.getItem(GLOBAL_KEY)) {
        setStep(0)
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    if (typeof window !== 'undefined') localStorage.setItem(GLOBAL_KEY, '1')
    setStep(null)
  }

  return (
    <>
      <button
        onClick={() => setStep(0)}
        style={{
          position: 'fixed', bottom: 28, left: 28, zIndex: 200,
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--surface)', border: '1px solid var(--border)',
          color: 'var(--muted)', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Tour"
      >?</button>

      {step !== null && (
        <div style={{
          position: 'fixed', bottom: 76, left: 28, zIndex: 201,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '16px 18px', maxWidth: 280, boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            {step + 1}/{TIPS.length} — {TIPS[step].label}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 14 }}>
            {TIPS[step].text}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {step < TIPS.length - 1
              ? <button onClick={() => setStep(s => (s ?? 0) + 1)} style={{ flex: 1, background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 7, padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Next →</button>
              : <button onClick={dismiss} style={{ flex: 1, background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 7, padding: '8px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Done</button>
            }
            <button onClick={dismiss} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 7, padding: '8px 12px', fontSize: 12, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}
    </>
  )
}
