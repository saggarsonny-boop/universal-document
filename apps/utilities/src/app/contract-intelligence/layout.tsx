import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Contract Intelligence — AI Extracts Key Dates and Risk Flags from Any Contract',
  description: 'Upload any contract and get back a structured document with AI-extracted renewal dates, termination deadlines, obligations, and risk flags. Never miss a contract date again.',
  keywords: 'contract intelligence software, contract review AI, contract key date extraction, contract renewal reminder tool, contract risk analysis, AI contract review, contract management software, missed contract renewal prevention, contract analysis tool',
  openGraph: {
    title: 'UD Contract Intelligence — AI Extracts Key Dates and Risk Flags from Any Contract',
    description: 'Upload any contract and get structured AI-extracted renewal dates, obligations, and risk flags embedded in a .uds file.',
    url: 'https://utilities.hive.baby/contract-intelligence',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
