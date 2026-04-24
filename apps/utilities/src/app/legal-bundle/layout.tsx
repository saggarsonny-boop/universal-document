import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Legal Bundle — Court-Ready Document Bundle with Bates Numbering and Chain of Custody',
  description: 'Package multiple documents into a court-ready .udz bundle with sequential Bates numbering, auto-generated cover sheet, privilege log template, and chain of custody. Runs entirely in your browser.',
  keywords: 'legal document bundle, court bundle creator, Bates numbering tool, litigation document package, legal bundle software, Relativity alternative, Concordance alternative, court bundle automation, discovery document bundle, chain of custody legal, e-discovery bundle tool',
  openGraph: {
    title: 'UD Legal Bundle — Court-Ready Document Bundle with Bates Numbering and Chain of Custody',
    description: 'Court-ready .udz bundles with sequential Bates numbering, cover sheet, privilege log template, and chain of custody. Free, browser-only.',
    url: 'https://utilities.hive.baby/legal-bundle',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
