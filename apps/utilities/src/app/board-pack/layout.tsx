import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Board Pack — Governed Board Meeting Document Packages with Auto-Expiry',
  description: 'Create board meeting document packages as tamper-evident governed archives. Auto-expiry after meeting. Chain of custody. Fraction of Diligent cost.',
  keywords: 'board pack software, board meeting documents tool, board portal alternative, Diligent alternative, BoardEffect alternative, board paper management, company secretary document tool, board governance software',
  openGraph: {
    title: 'UD Board Pack — Governed Board Meeting Document Packages with Auto-Expiry',
    description: 'Create board meeting document packages as tamper-evident governed archives. Auto-expiry after meeting.',
    url: 'https://utilities.hive.baby/board-pack',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
