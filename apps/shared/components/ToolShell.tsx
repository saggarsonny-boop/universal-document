'use client'
import { useEffect, useState } from 'react'
import { canAccess, getRequiredTier } from '../lib/feature-gates'
import UpgradePrompt from './UpgradePrompt'

interface ToolShellProps {
  toolId: string
  title: string
  description: string
  badge?: 'FREE' | 'AI' | 'Pro' | 'Enterprise'
  freeTierLabel?: string
  whatProUnlocks?: string
  children: React.ReactNode
}

const BADGE_STYLES: Record<string, { background: string; color: string }> = {
  FREE:       { background: 'var(--ud-teal-2)',  color: 'var(--ud-teal)' },
  'AI':       { background: 'var(--ud-teal-2)',  color: 'var(--ud-teal)' },
  Pro:        { background: 'var(--ud-gold-3)',  color: 'var(--ud-gold)' },
  Enterprise: { background: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
}

export default function ToolShell({ toolId, title, description, badge, freeTierLabel, whatProUnlocks, children }: ToolShellProps) {
  const [hasAccess, setHasAccess] = useState(true) // optimistic: show content, gate server-side post-beta

  useEffect(() => {
    // Beta: all tools accessible. Post-beta: check user tier via API.
    setHasAccess(canAccess(toolId, 'csdk_scale'))
  }, [toolId])

  const requiredTier = getRequiredTier(toolId)
  const bs = badge ? BADGE_STYLES[badge] : null

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
        ← All tools
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>
          {title}
        </h1>
        {badge && bs && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99,
              fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em',
              ...bs,
            }}>
              {badge}
            </span>
            {badge === 'Pro' || badge === 'Enterprise' ? (
              <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>
                Free during beta
              </span>
            ) : null}
          </div>
        )}
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        {description}
      </p>

      {freeTierLabel && (
        <span style={{
          display: 'inline-block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em',
          padding: '3px 10px', borderRadius: 99,
          background: 'var(--ud-teal-2)', color: 'var(--ud-teal)',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          marginBottom: 32,
        }}>
          {freeTierLabel}
        </span>
      )}

      {!freeTierLabel && <div style={{ marginBottom: 32 }} />}

      {hasAccess ? (
        children
      ) : (
        <UpgradePrompt
          toolName={title}
          requiredTier={requiredTier}
          whatProUnlocks={whatProUnlocks ?? `Upgrade to access ${title} and all Pro features.`}
        />
      )}

      <div style={{
        marginTop: 40, padding: '16px',
        background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)',
        borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)',
        fontFamily: 'var(--font-body)', textAlign: 'center',
      }}>
        Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
        No ads. No investors. No agenda.
      </div>
    </div>
  )
}
