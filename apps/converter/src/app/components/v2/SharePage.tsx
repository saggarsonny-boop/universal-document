'use client'

// Post-conversion view: download CTA, share buttons, related-engines
// cards, subtle bookmark prompt. The bookmark prompt is intentionally
// soft for v1 — Phase 4 will replace it with the canonical
// HiveAHTSPrompt from packages/hive-onboarding.

import { useState } from 'react'
import { useStrings } from '@/lib/strings'

const GOLD = '#D4AF37'

type Props = {
  outputName: string
  outputFormatLabel: string
  warnings?: string[]
  onDownload: () => void
  onConvertAnother: () => void
}

// Module-level fallback for the unrefactored ShareSection sub-component
// (see follow-up issue: TierIndicator + PaywallModal + ShareSection still on
// hardcoded English in this partial PR).
const SHARE_TEXT = 'I just used UD Converter to convert a file. No accounts, no tracking, free forever — try it.'
const SHARE_URL = 'https://converter.hive.baby'

// Tagline copy for the related-engines cards. The tagline strings are
// brand voice owned by each engine; keep them English here (each engine
// is responsible for localizing its own tagline if surfaced from its
// own UI). Only the section header is localized.
const RELATED_ENGINES = [
  { name: 'ParkBack',            tagline: 'Find your car. No accounts. No cloud.', url: 'https://parkback.hive.baby' },
  { name: 'HiveAestheticBestie', tagline: 'AI styling, no signup.',                url: 'https://hiveaestheticbestie.hive.baby' },
  { name: 'HiveMicroRitual',     tagline: 'Tiny rituals, daily.',                  url: 'https://hivemicroritual.hive.baby' },
]

export function SharePage({ outputName, outputFormatLabel, warnings, onDownload, onConvertAnother }: Props) {
  const s = useStrings()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Download card — the thing they came for */}
      <div style={{
        border: '1px solid rgba(10, 122, 106, 0.25)',
        borderRadius: 16,
        padding: '28px 24px',
        textAlign: 'center',
        background: 'var(--ud-teal-2, #e7f4f1)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--ud-teal, #0a7a6a)', margin: 0, marginBottom: 6 }}>
          {s.success.fileReadyTemplate.replace('{{format}}', outputFormatLabel)}
        </p>
        <p style={{ fontSize: 14, color: 'var(--ud-muted)', margin: 0, marginBottom: 18, wordBreak: 'break-all' }}>
          {outputName}
        </p>
        <button
          onClick={onDownload}
          style={primaryButtonStyle}
          aria-label={s.success.downloadAriaTemplate.replace('{{name}}', outputName)}
        >
          {s.success.downloadAgain}
        </button>
        <button
          onClick={onConvertAnother}
          style={{ ...secondaryButtonStyle, marginLeft: 10 }}
          aria-label={s.success.convertAnotherAria}
        >
          {s.success.convertAnother}
        </button>
      </div>

      {warnings && warnings.length > 0 && (
        <div style={{
          background: 'rgba(200, 150, 10, 0.08)',
          border: '1px solid rgba(200, 150, 10, 0.3)',
          borderRadius: 10,
          padding: '12px 14px',
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ud-ink)', margin: 0, marginBottom: 6 }}>
            {warnings.length === 1
              ? s.success.warningsHeadlineSingular
              : s.success.warningsHeadlinePluralTemplate.replace('{{n}}', String(warnings.length))}
          </p>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--ud-muted)', lineHeight: 1.5 }}>
            {warnings.map((w, i) => <li key={i} style={{ marginBottom: 3 }}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* Share row */}
      <ShareSection />

      {/* Related Hive engines */}
      <RelatedEngines />

      {/* Bookmark hint — placeholder until packages/hive-onboarding's AHTS prompt lands */}
      <div style={{
        textAlign: 'center',
        padding: '14px 16px',
        background: 'var(--ud-paper-2, #f2f1ee)',
        borderRadius: 10,
        border: '1px solid var(--ud-border)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--ud-muted)', margin: 0 }}>
          {s.success.bookmarkTipPrefix} <strong style={{ color: 'var(--ud-ink)' }}>{s.success.bookmarkTipDomain}</strong> {s.success.bookmarkTipSuffix}
        </p>
      </div>
    </div>
  )
}

function ShareSection() {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      window.prompt('Copy this link:', SHARE_URL)
    }
  }

  const tweetUrl  = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(SHARE_URL)}`
  const emailUrl  = `mailto:?subject=${encodeURIComponent('Try UD Converter')}&body=${encodeURIComponent(`${SHARE_TEXT}\n\n${SHARE_URL}`)}`
  const waUrl     = `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`

  return (
    <div style={{
      border: '1px solid var(--ud-border)',
      borderRadius: 12,
      padding: '16px 18px',
      background: '#fff',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', margin: 0, marginBottom: 4 }}>
        Tell a friend about UD Converter
      </p>
      <p style={{ fontSize: 12, color: 'var(--ud-muted)', margin: 0, marginBottom: 12 }}>
        Free, no signup, works in any browser.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button onClick={copyLink} style={shareButtonStyle} aria-label="Copy link to UD Converter">
          {copied ? '✓ Link copied' : '🔗 Copy link'}
        </button>
        <a href={tweetUrl} target="_blank" rel="noopener noreferrer" style={shareLinkStyle} aria-label="Share on Twitter">
          🐦 Twitter
        </a>
        <a href={emailUrl} style={shareLinkStyle} aria-label="Share by email">
          ✉️ Email
        </a>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" style={shareLinkStyle} aria-label="Share on WhatsApp">
          💬 WhatsApp
        </a>
      </div>
    </div>
  )
}

function RelatedEngines() {
  return (
    <div style={{
      border: '1px solid var(--ud-border)',
      borderRadius: 12,
      padding: '16px 18px',
      background: '#fff',
    }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', margin: 0, marginBottom: 12 }}>
        Try these other free Hive engines
      </p>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        {RELATED_ENGINES.map(e => (
          <a key={e.name} href={e.url} target="_blank" rel="noopener noreferrer" style={cardStyle}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', marginBottom: 2 }}>{e.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ud-muted)', lineHeight: 1.4 }}>{e.tagline}</div>
          </a>
        ))}
      </div>
      <p style={{ fontSize: 12, color: 'var(--ud-muted)', margin: '12px 0 0 0', textAlign: 'center' }}>
        <a href="https://hive.baby" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ud-teal, #0a7a6a)' }}>
          See all Hive engines →
        </a>
      </p>
    </div>
  )
}

const primaryButtonStyle: React.CSSProperties = {
  background: GOLD,
  color: '#1e2d3d',
  border: 'none',
  borderRadius: 10,
  padding: '12px 22px',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
  minHeight: 44,
}

const secondaryButtonStyle: React.CSSProperties = {
  background: 'transparent',
  color: 'var(--ud-ink)',
  border: '1px solid var(--ud-border)',
  borderRadius: 10,
  padding: '12px 18px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  minHeight: 44,
}

const shareButtonStyle: React.CSSProperties = {
  background: GOLD,
  color: '#1e2d3d',
  border: 'none',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  minHeight: 36,
}

const shareLinkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: 'var(--ud-paper-2, #f2f1ee)',
  color: 'var(--ud-ink)',
  border: '1px solid var(--ud-border)',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 500,
  textDecoration: 'none',
  minHeight: 36,
}

const cardStyle: React.CSSProperties = {
  display: 'block',
  padding: '12px 14px',
  background: 'var(--ud-paper-2, #f2f1ee)',
  border: '1px solid var(--ud-border)',
  borderRadius: 8,
  textDecoration: 'none',
  color: 'var(--ud-ink)',
}
