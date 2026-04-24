'use client'
import { useEffect, useState, useRef } from 'react'

const FRAMES = [
  {
    id: 'chaos',
    label: 'Legacy Chaos',
    caption: 'Old formats are messy.',
    duration: 700,
  },
  {
    id: 'converter',
    label: 'The Converter',
    caption: 'UD Converter cleans and transforms.',
    duration: 1100,
  },
  {
    id: 'uds',
    label: 'UDS Clarity',
    caption: 'UDS: perfect clarity for everyone.',
    duration: 1000,
  },
  {
    id: 'udr',
    label: 'UDR Editing',
    caption: 'UDR: editable, structured, intelligent.',
    duration: 1400,
  },
  {
    id: 'ecosystem',
    label: 'The Ecosystem',
    caption: 'One ecosystem. Infinite clarity.',
    duration: 1300,
  },
  {
    id: 'lockup',
    label: 'Universal Document™',
    caption: 'Universal Document™. For a universal world.',
    duration: 1500,
  },
]

const LEGACY_ICONS = ['PDF', 'DOC', 'TXT', 'CSV', 'JPG']

function LegacyIcon({ label, x, y, jitter }: { label: string; x: number; y: number; jitter: number }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      transform: `rotate(${jitter}deg)`,
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 6,
      padding: '6px 10px',
      fontSize: 13,
      fontWeight: 700,
      color: 'var(--ud-muted)',
      letterSpacing: '0.06em',
      animation: `chaos-jitter 0.3s ease infinite alternate`,
      animationDelay: `${jitter * 0.1}s`,
    }}>
      {label}
    </div>
  )
}

export default function LifecycleAnimation({ autoPlay = true }: { autoPlay?: boolean }) {
  const [frameIdx, setFrameIdx] = useState(0)
  const [visible, setVisible] = useState(true)
  const [playing, setPlaying] = useState(autoPlay)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const frame = FRAMES[frameIdx]

  useEffect(() => {
    if (!playing) return
    timerRef.current = setTimeout(() => {
      setVisible(false)
      setTimeout(() => {
        setFrameIdx(i => (i + 1) % FRAMES.length)
        setVisible(true)
      }, 200)
    }, frame.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [frameIdx, playing, frame.duration])

  const goTo = (i: number) => {
    setPlaying(false)
    setVisible(false)
    setTimeout(() => { setFrameIdx(i); setVisible(true) }, 150)
  }

  return (
    <div style={{
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 20,
      overflow: 'hidden',
      userSelect: 'none',
    }}>
      <style>{`
        @keyframes chaos-jitter { from { transform: rotate(-2deg) translateY(0); } to { transform: rotate(2deg) translateY(-3px); } }
        @keyframes float-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slide-right { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scale-in { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        @keyframes flow-loop {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Stage */}
      <div style={{
        height: 200,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        background: 'linear-gradient(135deg, #0a0c10 0%, #0d1120 100%)',
      }}>
        {frame.id === 'chaos' && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <LegacyIcon label="PDF" x={40} y={30} jitter={-8} />
            <LegacyIcon label="DOCX" x={120} y={60} jitter={5} />
            <LegacyIcon label="TXT" x={80} y={110} jitter={-3} />
            <LegacyIcon label="CSV" x={200} y={25} jitter={10} />
            <LegacyIcon label="JPG" x={240} y={90} jitter={-6} />
            <LegacyIcon label="HTML" x={160} y={140} jitter={4} />
            <LegacyIcon label="MD" x={310} y={50} jitter={-9} />
          </div>
        )}

        {frame.id === 'converter' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, animation: 'float-in 0.4s ease' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {LEGACY_ICONS.map(label => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4, padding: '3px 8px', fontSize: 13, fontWeight: 700, color: 'var(--ud-muted)',
                }}>{label}</div>
              ))}
            </div>
            <svg width="40" height="40" style={{ opacity: 0.6 }}>
              <path d="M5 20 L35 20" stroke="#4DA3FF" strokeWidth="2" strokeDasharray="4 2" />
              <path d="M28 13 L35 20 L28 27" fill="none" stroke="#4DA3FF" strokeWidth="2" />
            </svg>
            <div style={{
              width: 64, height: 64,
              background: '#003A8C',
              borderRadius: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0,58,140,0.5)',
            }}>
              <span style={{ fontFamily: 'Georgia,serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>UD</span>
            </div>
            <svg width="40" height="40" style={{ opacity: 0.6 }}>
              <path d="M5 20 L35 20" stroke="#4DA3FF" strokeWidth="2" strokeDasharray="4 2" />
              <path d="M28 13 L35 20 L28 27" fill="none" stroke="#4DA3FF" strokeWidth="2" />
            </svg>
            <div style={{
              width: 48, height: 62,
              background: 'white',
              borderRadius: 6,
              border: '1px solid #003A8C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 0 20px rgba(0,58,140,0.3)',
            }}>
              <span style={{ fontFamily: 'Georgia,serif', fontWeight: 800, fontSize: 13, color: '#003A8C', opacity: 0.15 }}>UD</span>
              <div style={{
                position: 'absolute', bottom: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#003A8C',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, fontWeight: 800, color: '#fff',
              }}>S</div>
            </div>
          </div>
        )}

        {frame.id === 'uds' && (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', animation: 'scale-in 0.4s ease' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 56, height: 72,
                background: 'white',
                borderRadius: 8,
                border: '2px solid #003A8C',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, padding: 6,
                transform: `translateY(${i % 2 === 0 ? 0 : -8}px) rotate(${(i - 1) * 3}deg)`,
                boxShadow: '0 4px 24px rgba(0,58,140,0.25)',
              }}>
                <span style={{ fontFamily: 'Georgia,serif', fontWeight: 800, fontSize: 14, color: '#003A8C', opacity: 0.12 }}>UD</span>
                <div style={{ width: 28, height: 2, borderRadius: 1, background: '#003A8C', opacity: 0.25 }} />
                <div style={{ width: 36, height: 2, borderRadius: 1, background: '#003A8C', opacity: 0.15 }} />
                <div style={{ width: 20, height: 2, borderRadius: 1, background: '#003A8C', opacity: 0.15 }} />
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', background: '#003A8C',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 800, color: '#fff', marginTop: 2,
                }}>S</div>
              </div>
            ))}
          </div>
        )}

        {frame.id === 'udr' && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', animation: 'slide-right 0.4s ease' }}>
            <div style={{
              width: 56, height: 72,
              background: 'white',
              borderRadius: 8,
              border: '2px solid #4DA3FF',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: 6,
              boxShadow: '0 4px 24px rgba(77,163,255,0.3)',
            }}>
              <span style={{ fontFamily: 'Georgia,serif', fontWeight: 800, fontSize: 14, color: '#4DA3FF', opacity: 0.12 }}>UD</span>
              <div style={{ width: 28, height: 2, borderRadius: 1, background: '#4DA3FF', opacity: 0.35 }} />
              <div style={{ width: 36, height: 2, borderRadius: 1, background: '#4DA3FF', opacity: 0.2 }} />
              <div style={{ width: 20, height: 2, borderRadius: 1, background: '#4DA3FF', opacity: 0.2 }} />
              <div style={{
                width: 16, height: 16, borderRadius: '50%', background: '#4DA3FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 8, fontWeight: 800, color: '#fff', marginTop: 2,
              }}>R</div>
            </div>
            <div style={{
              background: 'rgba(77,163,255,0.08)',
              border: '1px solid rgba(77,163,255,0.2)',
              borderRadius: 10,
              padding: '10px 14px',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              {['Sections', 'Metadata', 'Permissions', 'Clarity Layers'].map(item => (
                <div key={item} style={{
                  fontSize: 13, fontWeight: 600, color: '#4DA3FF',
                  padding: '4px 10px', background: 'rgba(77,163,255,0.1)',
                  borderRadius: 4,
                }}>{item}</div>
              ))}
            </div>
          </div>
        )}

        {frame.id === 'ecosystem' && (
          <div style={{ position: 'relative', width: 300, height: 160 }}>
            {[
              { label: 'Converter', x: 20, y: 60, color: '#003A8C' },
              { label: 'UDS', x: 110, y: 20, color: '#003A8C' },
              { label: 'Reader', x: 210, y: 60, color: '#1a5cb5' },
              { label: 'UDR', x: 160, y: 120, color: '#4DA3FF' },
              { label: 'Editor', x: 60, y: 120, color: '#4DA3FF' },
            ].map((node, i) => (
              <div key={node.label} style={{
                position: 'absolute', left: node.x, top: node.y,
                background: node.color,
                borderRadius: 20, padding: '4px 12px',
                fontSize: 13, fontWeight: 700, color: '#fff',
                animation: `float-in 0.4s ease ${i * 0.1}s both`,
              }}>
                {node.label}
              </div>
            ))}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3 }}>
              <path d="M80 75 C120 50 150 50 180 75" fill="none" stroke="#4DA3FF" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M240 80 C220 130 190 140 190 135" fill="none" stroke="#4DA3FF" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M165 135 C120 140 100 135 85 135" fill="none" stroke="#4DA3FF" strokeWidth="1.5" strokeDasharray="4 2" />
              <path d="M65 120 C45 100 38 95 38 85" fill="none" stroke="#4DA3FF" strokeWidth="1.5" strokeDasharray="4 2" />
            </svg>
          </div>
        )}

        {frame.id === 'lockup' && (
          <div style={{ textAlign: 'center', animation: 'scale-in 0.5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, background: '#003A8C', borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 30px rgba(0,58,140,0.5)',
              }}>
                <span style={{ fontFamily: 'Georgia,serif', fontWeight: 800, fontSize: 18, color: '#fff' }}>UD</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                Universal Document™
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Caption bar */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4DA3FF', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>
            {frame.label}
          </div>
          <div style={{ fontSize: 14, color: '#e2e8f0' }}>{frame.caption}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{
              padding: '6px 14px', fontSize: 13, fontWeight: 600,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, color: 'var(--ud-muted)', cursor: 'pointer',
            }}
          >
            {playing ? '⏸' : '▶'}
          </button>
        </div>
      </div>

      {/* Frame dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '8px 24px 16px' }}>
        {FRAMES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === frameIdx ? 20 : 6, height: 6, borderRadius: 3,
              background: i === frameIdx ? '#4DA3FF' : 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'width 0.2s, background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  )
}
