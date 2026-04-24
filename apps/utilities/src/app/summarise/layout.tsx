import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Summarise — AI Summary Embedded as a Clarity Layer in Your Document',
  description: 'Generate an AI summary of any .uds document using Claude. The summary is embedded as a Clarity Layer in the output file — not a separate document. Reader, patient, and executive layers available.',
  keywords: 'document summarisation AI, AI document summary, Claude document summary, clarity layer document, document summary tool, ChatGPT summary alternative, Adobe Acrobat summary alternative, executive summary generator, patient summary document, document AI tool',
  openGraph: {
    title: 'UD Summarise — AI Summary Embedded as a Clarity Layer in Your Document',
    description: 'Claude AI summaries embedded as Clarity Layers inside your .uds document — not a separate file.',
    url: 'https://utilities.hive.baby/summarise',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
