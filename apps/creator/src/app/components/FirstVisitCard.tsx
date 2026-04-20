'use client'
import { useEffect, useState } from 'react'

const KEY = 'hive_welcomed_udcreator'

export default function FirstVisitCard() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setShow(true)
  }, [])

  function dismiss() {
    localStorage.setItem(KEY, '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18,
        padding: '32px 28px', maxWidth: 360, width: '100%', margin: '0 20px', textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>✏️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
          Build a Universal Document
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Try adding a heading and a paragraph. Export as .udr or .uds.
        </p>
        <button onClick={dismiss} style={{
          background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 10,
          padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', width: '100%',
        }}>
          Start creating →
        </button>
      </div>
    </div>
  )
}
