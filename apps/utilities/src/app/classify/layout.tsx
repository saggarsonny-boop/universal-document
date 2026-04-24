import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Classify — AI Document Classification with Security Label Embedded in the File',
  description: 'Classify any .uds document as Public, Internal, Confidential, or Restricted using Claude AI. The classification label and reasoning are embedded as structured metadata in the output file.',
  keywords: 'document classification AI, security classification tool, document sensitivity classifier, Microsoft Purview alternative, information classification tool, document labelling tool, security label document, confidentiality classification, AI document triage, automated document classification',
  openGraph: {
    title: 'UD Classify — AI Document Classification with Security Label Embedded in the File',
    description: 'AI-powered document classification — Public, Internal, Confidential, Restricted — with label embedded as metadata in your .uds file.',
    url: 'https://utilities.hive.baby/classify',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
