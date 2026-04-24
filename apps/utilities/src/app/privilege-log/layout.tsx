import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Privilege Log — Structured Attorney-Client and Work Product Privilege Log',
  description: 'Build a court-compliant privilege log with Bates numbers, privilege types, document metadata, and sealed chain of custody. Exports as a tamper-evident .uds file. Browser-only, no server upload.',
  keywords: 'privilege log tool, attorney-client privilege log, work product privilege log, litigation privilege log, discovery privilege log, Bates number privilege log, court privilege log, e-discovery privilege log, privilege log generator, FRCP privilege log, legal document privilege',
  openGraph: {
    title: 'UD Privilege Log — Structured Attorney-Client and Work Product Privilege Log',
    description: 'Court-compliant privilege logs with Bates numbers, privilege types, and tamper-evident sealing. Free, browser-only.',
    url: 'https://utilities.hive.baby/privilege-log',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
