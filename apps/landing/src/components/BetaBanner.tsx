'use client'
import { usePathname } from 'next/navigation'

const SUPPRESS_ON = ['/whitepaper']

export default function BetaBanner() {
  const path = usePathname()
  if (SUPPRESS_ON.some(p => path === p || path.startsWith(p + '/'))) return null
  return (
    <div style={{ background: '#c8960a', color: '#1e2d3d', fontFamily: 'var(--font-mono)', fontSize: 13, textAlign: 'center', padding: '0 24px', height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.05em', textTransform: 'uppercase', flexShrink: 0 }}>
      ✦ All Pro features free during beta — no account required · no credit card · full access while we build ✦
    </div>
  )
}
