import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Safety Report — Tamper-Evident Safety Incident Reports',
  description: 'Create tamper-evident safety incident reports for workplace accidents, near misses, equipment failures, and adverse events. Sealed at time of writing. Cannot be backdated. Legally defensible. Free.',
  keywords: 'safety incident report, workplace accident report, near miss report, adverse event report, RIDDOR report, safety document, occupational health report, tamper-evident incident report',
  openGraph: {
    title: 'UD Safety Report — Tamper-Evident Safety Incident Reports',
    description: 'Tamper-evident safety incident reports sealed at time of writing. Cannot be backdated. Legally defensible.',
    url: 'https://utilities.hive.baby/safety-report',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
