import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Claims Package — Bundle Insurance Claim Documents with Evidence and Chain of Custody',
  description: 'Bundle a claim form, incident report, and supporting evidence into a structured .udz claims package with chain of custody and tamper-evident sealing. Free, browser-only.',
  keywords: 'insurance claims package, claims bundle tool, incident report bundle, claims evidence package, insurance claim document, claims management tool, claims submission bundle, claims chain of custody, structured claims document, claims evidence bundling',
  openGraph: {
    title: 'UD Claims Package — Bundle Insurance Claim Documents with Evidence and Chain of Custody',
    description: 'Bundle claim form, incident report, and evidence into a .udz claims package with chain of custody. Free, browser-only.',
    url: 'https://utilities.hive.baby/claims-package',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
