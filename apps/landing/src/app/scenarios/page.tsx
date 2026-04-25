import { AnimatedScenario } from '@/components/AnimatedScenario'
import Link from 'next/link'

export const metadata = { title: 'Scenarios — Universal Document™' }

export default function ScenariosIndexPage() {
  return (
    <main style={{ padding: '64px 24px 96px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <Link
        href="/whitepaper"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#6b7280', textDecoration: 'none', marginBottom: 48 }}
      >
        ← Back to whitepaper
      </Link>

      <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#1e2d3d', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 12, marginTop: 0 }}>
        Scenario Walkthroughs
      </h1>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: 17, color: '#6b7280', lineHeight: 1.7, maxWidth: 560, marginBottom: 56, marginTop: 0 }}>
        Three stories showing what Universal Document™ does that PDF cannot. Hover to pause. Click dots to navigate.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <AnimatedScenario scenario="clinical" />
        <AnimatedScenario scenario="contract" />
        <AnimatedScenario scenario="research" />
      </div>

      <p style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: '#6b7280', letterSpacing: '0.05em', marginTop: 56, paddingTop: 24, borderTop: '1px solid #e0ddd6' }}>
        Universal Document™ Incorporated · April 2026 · CC BY 4.0
      </p>
    </main>
  )
}
