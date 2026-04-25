'use client'
import React, { useState, useEffect } from 'react'

type Step = {
  prose: string[]
  tool?: { url: string; desc: string }
}

function parseMd(md: string): {
  title: string
  subtitle?: string
  steps: Step[]
  footer?: string
} {
  const parts = md.split(/\n---\n/)

  const headerLines = parts[0].trim().split('\n').filter(l => l.trim())
  const title = headerLines.find(l => l.startsWith('# '))?.slice(2) || ''
  const subtitle = headerLines.find(l => l.startsWith('### '))?.slice(4)

  let contentParts = parts.slice(1)

  let footer: string | undefined
  const lastPart = contentParts[contentParts.length - 1]?.trim() || ''
  if (lastPart.startsWith('*') && lastPart.endsWith('*') && !lastPart.startsWith('**')) {
    footer = lastPart.slice(1, -1)
    contentParts = contentParts.slice(0, -1)
  }

  const steps: Step[] = contentParts.map(part => {
    const lines = part.trim().split('\n').filter(l => l.trim())
    const step: Step = { prose: [] }
    for (const line of lines) {
      const toolMatch = line.match(/^\*\*([\w.-]+\.(?:hive\.baby|baby)(?:\/[\w/-]*)?)\*\*\s*—\s*(.+)$/)
      if (toolMatch) {
        step.tool = { url: toolMatch[1], desc: toolMatch[2] }
      } else if (line.trim()) {
        step.prose.push(line)
      }
    }
    return step
  })

  return { title, subtitle, steps, footer }
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return parts.map((p, i) => {
    if (i % 2 === 1) {
      const urlMatch = p.match(/^([\w.-]+\.(?:hive\.baby|baby)(?:\/[\w/-]*)?)$/)
      if (urlMatch) {
        return (
          <a key={i} href={`https://${p}`} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--ud-gold)', textDecoration: 'none', borderBottom: '1px solid rgba(200,150,10,0.3)' }}>
            {p}
          </a>
        )
      }
      return <strong key={i}>{p}</strong>
    }
    const codeParts = p.split(/`([^`]+)`/g)
    return codeParts.map((cp, ci) =>
      ci % 2 === 1
        ? <code key={ci} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9em', background: 'rgba(200,150,10,0.08)', padding: '1px 4px', borderRadius: 3 }}>{cp}</code>
        : cp
    )
  })
}

export function ScenarioPageClient({ md, backLabel, backHref }: { md: string; backLabel: string; backHref: string }) {
  const { title, subtitle, steps, footer } = parseMd(md)
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const goTo = (next: number) => {
    if (next < 0 || next >= steps.length) return
    setAnimKey(k => k + 1)
    setStep(next)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goTo(step + 1)
      if (e.key === 'ArrowLeft') goTo(step - 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const current = steps[step]

  return (
    <main style={{ padding: '64px 24px 96px', maxWidth: 720, margin: '0 auto', width: '100%' }}>
      <style>{`
        @keyframes ud-slide-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ud-tool-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <a href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ud-muted)', textDecoration: 'none', marginBottom: 48 }}>
        ← {backLabel}
      </a>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,40px)', fontWeight: 700, color: 'var(--ud-ink)', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 8 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 400, fontStyle: 'italic', color: 'var(--ud-gold)', marginBottom: 40, marginTop: 0 }}>
          {subtitle}
        </p>
      )}

      {/* Progress bar */}
      <div style={{ height: 2, background: 'var(--ud-border)', borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: 'var(--ud-gold)', borderRadius: 99,
          width: `${((step + 1) / steps.length) * 100}%`,
          transition: 'width 0.4s ease',
        }} />
      </div>

      {/* Step counter + dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)' }}>
        <span><strong style={{ color: 'var(--ud-ink)' }}>{step + 1}</strong> of {steps.length}</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Step ${i + 1}`}
              style={{
                width: i === step ? 18 : 6,
                height: 6,
                borderRadius: 99,
                background: i === step ? 'var(--ud-gold)' : 'var(--ud-border)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Animated step content */}
      <div key={animKey} style={{ animation: 'ud-slide-in 0.38s ease both', minHeight: 220 }}>
        {current.prose.map((line, i) => (
          <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--ud-ink)', lineHeight: 1.85, marginBottom: 16 }}>
            {renderInline(line)}
          </p>
        ))}
        {current.tool && (
          <div style={{
            background: 'var(--ud-paper-2)',
            border: '1px solid var(--ud-border)',
            borderLeft: '3px solid var(--ud-gold)',
            borderRadius: 'var(--ud-radius)',
            padding: '14px 18px',
            marginTop: 28,
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            animation: 'ud-tool-in 0.4s 0.18s ease both',
          }}>
            <a href={`https://${current.tool.url}`} target="_blank" rel="noopener noreferrer"
              style={{ color: 'var(--ud-gold)', textDecoration: 'none', fontWeight: 700 }}>
              {current.tool.url}
            </a>
            <span style={{ color: 'var(--ud-muted)' }}> — {current.tool.desc}</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--ud-border)' }}>
        <button
          onClick={() => goTo(step - 1)}
          disabled={step === 0}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: '1px solid var(--ud-border)',
            borderRadius: 'var(--ud-radius)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: step === 0 ? 'var(--ud-border)' : 'var(--ud-ink)',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            transition: 'border-color 0.2s, color 0.2s',
          }}
        >
          ← Previous
        </button>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ud-muted)', letterSpacing: '0.06em' }}>
          ← → TO NAVIGATE
        </span>

        <button
          onClick={() => goTo(step + 1)}
          disabled={step === steps.length - 1}
          style={{
            padding: '10px 24px',
            background: step === steps.length - 1 ? 'var(--ud-border)' : 'var(--ud-gold)',
            border: 'none',
            borderRadius: 'var(--ud-radius)',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            fontWeight: 700,
            color: step === steps.length - 1 ? 'var(--ud-muted)' : '#1e2d3d',
            cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Next →
        </button>
      </div>

      {footer && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ud-muted)', letterSpacing: '0.05em', marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--ud-border)' }}>
          {footer}
        </p>
      )}
    </main>
  )
}
