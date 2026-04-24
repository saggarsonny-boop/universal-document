import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD FOI Bundle — Package Freedom of Information Responses with Redaction Index and Audit Trail',
  description: 'Bundle FOI response documents into a structured .udz with redaction index, exemption log, and chain of custody. Compliant structure for UK FOIA, US FOIA, and equivalent legislation. Free, browser-only.',
  keywords: 'FOI bundle tool, Freedom of Information response, FOIA document package, FOI redaction index, information request bundle, UK FOIA compliance, US FOIA response, public records request bundle, FOI exemption log, SharePoint FOI alternative',
  openGraph: {
    title: 'UD FOI Bundle — Package Freedom of Information Responses with Redaction Index and Audit Trail',
    description: 'Structured .udz FOI response bundles with redaction index, exemption log, and chain of custody. Free, browser-only.',
    url: 'https://utilities.hive.baby/foi-bundle',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
