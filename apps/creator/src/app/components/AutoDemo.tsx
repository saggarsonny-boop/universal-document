'use client'
import { useEffect, useState } from 'react'

const KEY = 'hive_demo_udcreator'

const DEMO_TITLE = 'Clinical handover — ICU bay 4'
const DEMO_CONTENT = `Patient: Mr Okafor, 67, post-CABG day 2. SpO2 dropped 97→91% over 20 min. RR 24. Drain output 40 ml/hr × 2 hours. Restless but arousable. Neck veins raised. Plan: urgent echo, increase FiO2, alert cardiothoracic registrar.`

export default function AutoDemo() {
  const [visible, setVisible] = useState(false)
  const [titleIdx, setTitleIdx] = useState(0)
  const [contentIdx, setContentIdx] = useState(0)
  const [phase, setPhase] = useState<'title' | 'content' | 'done'>('title')

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(KEY)) return
    const t = setTimeout(() => setVisible(true), 800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    if (phase === 'title' && titleIdx < DEMO_TITLE.length) {
      const t = setTimeout(() => setTitleIdx(i => i + 1), 35)
      return () => clearTimeout(t)
    }
    if (phase === 'title' && titleIdx === DEMO_TITLE.length) {
      const t = setTimeout(() => setPhase('content'), 300)
      return () => clearTimeout(t)
    }
    if (phase === 'content' && contentIdx < DEMO_CONTENT.length) {
      const t = setTimeout(() => setContentIdx(i => i + 1), 18)
      return () => clearTimeout(t)
    }
    if (phase === 'content' && contentIdx === DEMO_CONTENT.length) {
      const t = setTimeout(() => setPhase('done'), 400)
      return () => clearTimeout(t)
    }
  }, [visible, phase, titleIdx, contentIdx])

  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => {
        setVisible(false)
        localStorage.setItem(KEY, '1')
      }, 6000)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 200,
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '18px 20px', maxWidth: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'fadeIn 0.4s ease',
    }}>
      <div style={{ fontSize: 13, color: 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
        Demo — see what UD Creator does
      </div>
      <div style={{ fontSize: 13, color: 'rgba(180,200,225,0.4)', marginBottom: 6 }}>Title</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', minHeight: 20, marginBottom: 10 }}>
        {DEMO_TITLE.slice(0, titleIdx)}{phase === 'title' ? '|' : ''}
      </div>
      {phase !== 'title' && (
        <>
          <div style={{ fontSize: 13, color: 'rgba(180,200,225,0.4)', marginBottom: 6 }}>Content</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, minHeight: 60 }}>
            {DEMO_CONTENT.slice(0, contentIdx)}{phase === 'content' ? '|' : ''}
          </div>
        </>
      )}
      {phase === 'done' && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#4ade80' }}>✓ Exported as .udr</span>
          <button onClick={() => { setVisible(false); localStorage.setItem(KEY, '1') }}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--muted)', fontSize: 13, cursor: 'pointer' }}>
            Dismiss
          </button>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  )
}
