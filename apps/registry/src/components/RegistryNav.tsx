'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Governance', href: '/governance' },
  { label: 'Schemas', href: '/schemas' },
]

export default function RegistryNav() {
  const pathname = usePathname()

  return (
    <header style={{
      height: 56,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: '#1e2d3d',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 0 rgba(0,0,0,0.25)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a href="https://universaldocument.org" style={{ textDecoration: 'none', fontSize: 18, lineHeight: '1' }}>🌍</a>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <img src="/icons/ud-logo.svg" width={28} height={28} alt="Universal Document" style={{ borderRadius: 5, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 16,
            color: '#ffffff',
            letterSpacing: '-0.01em',
          }}>
            Schema Registry
          </span>
        </Link>
      </div>
      <nav style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
        {LINKS.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--ud-gold)' : 'rgba(255,255,255,0.75)',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
            >
              {link.label}
            </Link>
          )
        })}
        <a
          href="https://universaldocument.org"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            textDecoration: 'none',
          }}
        >
          universaldocument.org
        </a>
      </nav>
    </header>
  )
}
