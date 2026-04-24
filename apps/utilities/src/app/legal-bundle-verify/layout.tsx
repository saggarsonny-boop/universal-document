import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Legal Bundle Verify — Verify Completeness and Integrity of Legal Document Bundles',
  description: 'Verify any .udz legal bundle is complete, untampered, and Bates sequence is intact. Admissible verification report. Pro tier.',
  keywords: 'legal bundle verification, eDiscovery integrity check, Bates sequence verification, document bundle completeness, legal document authenticity',
  openGraph: {
    title: 'UD Legal Bundle Verify — Verify Completeness and Integrity of Legal Document Bundles',
    description: 'Verify any .udz legal bundle is complete, untampered, and Bates sequence is intact. Admissible verification report.',
    url: 'https://utilities.hive.baby/legal-bundle-verify',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
