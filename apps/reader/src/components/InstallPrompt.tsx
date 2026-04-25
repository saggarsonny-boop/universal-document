'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState<Event | null>(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed || !prompt) return null

  return (
    <div style={{
      marginTop: 24,
      padding: '12px 16px',
      border: '1px solid var(--ud-border)',
      borderRadius: 'var(--ud-radius)',
      background: 'var(--ud-paper-2)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16, flexWrap: 'wrap',
    }}>
      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--ud-muted)' }}>
        Install UD Reader — open .uds files like any other app
      </span>
      <button
        onClick={async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (prompt as any).prompt()
          if (result?.outcome === 'accepted' || !result) setInstalled(true)
          setPrompt(null)
        }}
        style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          padding: '6px 16px', borderRadius: 'var(--ud-radius)',
          background: 'var(--ud-ink)', color: '#fff', border: 'none',
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        Install →
      </button>
    </div>
  )
}
