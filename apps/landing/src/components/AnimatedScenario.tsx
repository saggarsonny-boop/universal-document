'use client'
import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface AnimStep {
  label: string
  tool: string
  fileType: 'UDR' | 'UDS'
  blocks: Array<{ w: number; c: string }>
  badge?: string
  badgeC?: string
  icon?: 'lock' | 'globe' | 'check' | 'alert' | 'stamp' | 'btc' | 'ai'
}

// Icon paths (viewBox 0 0 24 24)
function Icon({ type, color }: { type: AnimStep['icon']; color: string }) {
  if (!type) return null
  const icons: Record<string, React.ReactNode> = {
    lock: <path d="M12 1C9.24 1 7 3.24 7 6v2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V10a2 2 0 00-2-2h-2V6c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3v2H9V6c0-1.66 1.34-3 3-3zm0 10a2 2 0 110 4 2 2 0 010-4z" fill={color} />,
    globe: <><circle cx="12" cy="12" r="10" fill="none" stroke={color} strokeWidth="2"/><path d="M12 2c-2.76 4-2.76 16 0 20M12 2c2.76 4 2.76 16 0 20M2 12h20" fill="none" stroke={color} strokeWidth="1.5"/></>,
    check: <><circle cx="12" cy="12" r="10" fill={color} opacity="0.15"/><path d="M7 12l4 4 6-6" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></>,
    alert: <path d="M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 5v4h2v-4h-2zm0 6v2h2v-2h-2z" fill={color} />,
    stamp: <path d="M20 18H4v2h16v-2zm-7-2v-3.5c2.21-.63 3.88-2.5 3.98-4.74C17.08 5.33 14.84 3 12 3S6.92 5.33 6.98 7.76C7.08 10 8.75 11.87 10.98 12.5V16h2z" fill={color} />,
    btc: <text x="6" y="18" fontFamily="monospace" fontSize="16" fontWeight="900" fill={color}>₿</text>,
    ai: <><circle cx="12" cy="12" r="3" fill={color}/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
  }
  return <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>{icons[type]}</svg>
}

function DocSVG({ step, animKey }: { step: AnimStep; animKey: number }) {
  const sealed = step.fileType === 'UDS'
  const typeBg = sealed ? '#1e2d3d' : '#c8960a'
  const badgeC = step.badgeC ?? typeBg
  return (
    <svg
      key={animKey}
      viewBox="0 0 180 216"
      style={{ width: '100%', maxWidth: 160, filter: 'drop-shadow(0 6px 20px rgba(30,45,61,0.14))' }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes blk { from { opacity:0; transform: scaleX(0); transform-origin: left; } to { opacity:1; transform: scaleX(1); transform-origin: left; } }
        @keyframes badgeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        @keyframes docIn { from { opacity:0; transform: scale(0.95); } to { opacity:1; transform: scale(1); } }
      `}</style>

      {/* Document body */}
      <path d="M16 12 L148 12 L168 32 L168 204 L16 204 Z"
        fill="white" stroke="#e0ddd6" strokeWidth="1.5"
        style={{ animation: 'docIn 0.35s ease both' }} />
      {/* Folded corner */}
      <path d="M148 12 L168 32 L148 32 Z"
        fill="#f2f1ee" stroke="#e0ddd6" strokeWidth="1.5" />

      {/* File type label */}
      <rect x="16" y="12" width="48" height="17" fill={typeBg} />
      <text x="40" y="24.5" textAnchor="middle" fill="white" fontSize="7.5" fontFamily="DM Mono,monospace" fontWeight="700" letterSpacing="0.5">
        .{step.fileType}
      </text>

      {/* Content blocks */}
      {step.blocks.map((b, i) => (
        <rect
          key={i}
          x="24" y={50 + i * 28}
          width={b.w} height="9"
          rx="2"
          fill={b.c}
          style={{ animation: `blk 0.4s ${0.08 + i * 0.07}s ease both` }}
        />
      ))}

      {/* Overlay icon (top-right) */}
      {step.icon && (
        <g style={{ animation: 'badgeIn 0.4s 0.2s ease both' }}>
          <circle cx="148" cy="44" r="14" fill={badgeC === '#dc2626' ? '#dc2626' : badgeC === '#059669' ? '#059669' : '#1e2d3d'} opacity="0.9" />
          <g transform="translate(136,32)">
            <Icon type={step.icon} color="white" />
          </g>
        </g>
      )}

      {/* Status badge */}
      {step.badge && (
        <g style={{ animation: 'badgeIn 0.4s 0.25s ease both' }}>
          <rect x="24" y="178" width={Math.min(step.badge.length * 6.8 + 14, 136)} height="16" rx="3" fill={badgeC} />
          <text x="31" y="190" fill="white" fontSize="7" fontFamily="DM Mono,monospace" fontWeight="700" letterSpacing="0.8">
            {step.badge}
          </text>
        </g>
      )}
    </svg>
  )
}

const SCENARIOS = {
  clinical: {
    href: '/scenarios/clinical-record',
    title: 'The Discharge Summary',
    subtitle: 'A document that knows who is reading it',
    steps: [
      { label: 'Authored as structured semantic blocks', tool: 'creator.hive.baby', fileType: 'UDR' as const, blocks: [{ w: 100, c: '#1e2d3d' }, { w: 80, c: '#6b7280' }, { w: 90, c: '#6b7280' }, { w: 65, c: '#6b7280' }] },
      { label: 'Twi added as parallel language stream', tool: 'utilities.hive.baby/translate', fileType: 'UDR' as const, blocks: [{ w: 100, c: '#1e2d3d' }, { w: 80, c: '#c8960a' }, { w: 90, c: '#c8960a' }, { w: 65, c: '#c8960a' }], badge: 'TWI', badgeC: '#c8960a', icon: 'globe' as const },
      { label: 'Sealed with SHA-256 — hash written to registry', tool: 'signer.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 100, c: '#1e2d3d' }, { w: 80, c: '#4b5563' }, { w: 90, c: '#4b5563' }, { w: 65, c: '#4b5563' }], badge: 'SEALED', badgeC: '#1e2d3d', icon: 'lock' as const },
      { label: 'Patient reads in Twi · pharmacist in English', tool: 'reader.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 100, c: '#1e2d3d' }, { w: 80, c: '#4b5563' }, { w: 90, c: '#4b5563' }, { w: 65, c: '#4b5563' }], badge: 'HASH VERIFIED', badgeC: '#059669', icon: 'check' as const },
      { label: 'Medication changed — registry revoked', tool: 'utilities.hive.baby/revoke', fileType: 'UDS' as const, blocks: [{ w: 100, c: '#dc2626' }, { w: 80, c: '#dc2626' }, { w: 90, c: '#dc2626' }, { w: 65, c: '#dc2626' }], badge: 'REVOKED', badgeC: '#dc2626', icon: 'alert' as const },
      { label: 'Correction reaches every reader, every language', tool: 'reader.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 100, c: '#1e2d3d' }, { w: 80, c: '#6b7280' }, { w: 90, c: '#6b7280' }, { w: 65, c: '#6b7280' }], badge: 'ERROR CANNOT PERSIST', badgeC: '#1e2d3d' },
    ],
  },
  contract: {
    href: '/scenarios/contract-lifecycle',
    title: 'The Lease',
    subtitle: 'A document that proves itself',
    steps: [
      { label: 'PDF converted to Universal Document™', tool: 'converter.hive.baby', fileType: 'UDR' as const, blocks: [{ w: 112, c: '#1e2d3d' }, { w: 90, c: '#6b7280' }, { w: 100, c: '#6b7280' }, { w: 75, c: '#6b7280' }] },
      { label: 'Terms negotiated with tracked changes', tool: 'creator.hive.baby', fileType: 'UDR' as const, blocks: [{ w: 112, c: '#1e2d3d' }, { w: 90, c: '#c8960a' }, { w: 100, c: '#c8960a' }, { w: 75, c: '#6b7280' }], badge: 'DRAFT v3', badgeC: '#c8960a' },
      { label: 'Signed by both parties — hash locked', tool: 'signer.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 112, c: '#1e2d3d' }, { w: 90, c: '#4b5563' }, { w: 100, c: '#4b5563' }, { w: 75, c: '#4b5563' }], badge: 'SIGNED', badgeC: '#1e2d3d', icon: 'stamp' as const },
      { label: 'Notarised — registry entry written', tool: 'signer.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 112, c: '#1e2d3d' }, { w: 90, c: '#4b5563' }, { w: 100, c: '#4b5563' }, { w: 75, c: '#4b5563' }], badge: 'NOTARISED', badgeC: '#1e2d3d', icon: 'lock' as const },
      { label: '3 years later: hash matches — document unchanged', tool: 'reader.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 112, c: '#1e2d3d' }, { w: 90, c: '#4b5563' }, { w: 100, c: '#4b5563' }, { w: 75, c: '#4b5563' }], badge: 'UNCHANGED · 3 YRS', badgeC: '#059669', icon: 'check' as const },
      { label: 'Dispute resolved — no solicitor, no court', tool: 'reader.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 112, c: '#1e2d3d' }, { w: 90, c: '#4b5563' }, { w: 100, c: '#4b5563' }, { w: 75, c: '#4b5563' }], badge: 'DOCUMENT PROVES ITSELF', badgeC: '#1e2d3d' },
    ],
  },
  research: {
    href: '/scenarios/research-paper',
    title: 'The Paper',
    subtitle: 'A document that thinks',
    steps: [
      { label: 'Authored with queryable data tables as blocks', tool: 'creator.hive.baby', fileType: 'UDR' as const, blocks: [{ w: 105, c: '#1e2d3d' }, { w: 80, c: '#6b7280' }, { w: 95, c: '#c8960a' }, { w: 70, c: '#6b7280' }] },
      { label: 'Translated into 4 languages — one file', tool: 'utilities.hive.baby/translate', fileType: 'UDR' as const, blocks: [{ w: 105, c: '#1e2d3d' }, { w: 80, c: '#c8960a' }, { w: 95, c: '#c8960a' }, { w: 70, c: '#c8960a' }], badge: '4 LANGUAGES', badgeC: '#c8960a', icon: 'globe' as const },
      { label: 'Bitcoin-timestamped at block height', tool: 'signer.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 105, c: '#1e2d3d' }, { w: 80, c: '#4b5563' }, { w: 95, c: '#4b5563' }, { w: 70, c: '#4b5563' }], badge: 'BTC TIMESTAMPED', badgeC: '#f59e0b', icon: 'btc' as const },
      { label: 'Published with full provenance chain', tool: 'ud.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 105, c: '#1e2d3d' }, { w: 80, c: '#4b5563' }, { w: 95, c: '#4b5563' }, { w: 70, c: '#4b5563' }], badge: 'SEALED', badgeC: '#1e2d3d', icon: 'lock' as const },
      { label: 'AI reads data tables directly — no parser', tool: 'utilities.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 105, c: '#1e2d3d' }, { w: 80, c: '#4b5563' }, { w: 95, c: '#c8960a' }, { w: 70, c: '#4b5563' }], badge: 'MACHINE-READABLE', badgeC: '#7c3aed', icon: 'ai' as const },
      { label: 'Cited anywhere — hash is the citation', tool: 'reader.hive.baby', fileType: 'UDS' as const, blocks: [{ w: 105, c: '#1e2d3d' }, { w: 80, c: '#4b5563' }, { w: 95, c: '#4b5563' }, { w: 70, c: '#4b5563' }], badge: 'HASH = CITATION', badgeC: '#1e2d3d', icon: 'check' as const },
    ],
  },
}

export type ScenarioKey = keyof typeof SCENARIOS

export function AnimatedScenario({ scenario, autoplay = true }: { scenario: ScenarioKey; autoplay?: boolean }) {
  const s = SCENARIOS[scenario]
  const [idx, setIdx] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((next: number) => {
    setAnimKey(k => k + 1)
    setIdx(next)
  }, [])

  useEffect(() => {
    if (!autoplay || paused) return
    const t = setTimeout(() => goTo((idx + 1) % s.steps.length), 3000)
    return () => clearTimeout(t)
  }, [idx, paused, autoplay, s.steps.length, goTo])

  const current = s.steps[idx]

  return (
    <article
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 32,
        alignItems: 'center',
        background: 'var(--ud-paper)',
        border: '1px solid var(--ud-border)',
        borderRadius: 12,
        padding: '32px 36px',
        transition: 'box-shadow 0.2s',
      }}
    >
      <style>{`
        @media (max-width: 560px) {
          .anim-card-grid { grid-template-columns: 1fr !important; }
          .anim-card-doc { display: none !important; }
        }
        @keyframes stepIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* SVG document */}
      <div className="anim-card-doc" style={{ display: 'flex', justifyContent: 'center' }}>
        <DocSVG step={current} animKey={animKey} />
      </div>

      {/* Text content */}
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-gold)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
          {scenario === 'clinical' ? 'Clinical Record' : scenario === 'contract' ? 'Contract Lifecycle' : 'Research Paper'}
        </p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(18px,3vw,24px)', fontWeight: 700, color: 'var(--ud-ink)', letterSpacing: '-0.02em', marginBottom: 4, marginTop: 0 }}>
          {s.title}
        </h2>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontStyle: 'italic', color: 'var(--ud-muted)', marginBottom: 24, marginTop: 0 }}>
          {s.subtitle}
        </p>

        {/* Step label */}
        <div
          key={animKey}
          style={{ animation: 'stepIn 0.35s ease both', minHeight: 52 }}
        >
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--ud-ink)', lineHeight: 1.6, marginBottom: 8, marginTop: 0 }}>
            {current.label}
          </p>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>
            {current.tool}
          </span>
        </div>

        {/* Dots + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {s.steps.map((_, i) => (
              <button
                key={i}
                onClick={() => { setPaused(true); goTo(i) }}
                aria-label={`Step ${i + 1}`}
                style={{
                  width: i === idx ? 16 : 5,
                  height: 5,
                  borderRadius: 99,
                  background: i === idx ? 'var(--ud-gold)' : 'var(--ud-border)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
            {autoplay && !paused && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ud-muted)', marginLeft: 6 }}>AUTO</span>
            )}
          </div>
          <Link
            href={s.href}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--ud-gold)',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(200,150,10,0.35)',
              paddingBottom: 1,
            }}
          >
            Read full scenario →
          </Link>
        </div>
      </div>
    </article>
  )
}
