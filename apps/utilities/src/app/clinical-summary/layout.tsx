import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Clinical Summary — AI-Powered Patient & Clinician Document Layers',
  description: 'Generate plain-language patient summaries and clinical professional summaries from any medical document. Both embedded in one tamper-evident file. Free during beta.',
  keywords: 'clinical summarization, patient-friendly medical records, discharge summary AI, clinical NLP, health literacy tool, EHR summary generator, NHS document tool',
  openGraph: {
    title: 'UD Clinical Summary — AI-Powered Patient & Clinician Document Layers',
    description: 'Generate plain-language patient summaries and clinical professional summaries from any medical document. Both embedded in one tamper-evident file.',
    url: 'https://utilities.hive.baby/clinical-summary',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
