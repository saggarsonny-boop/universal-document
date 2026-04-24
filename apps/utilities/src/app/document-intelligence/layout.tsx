export const metadata = {
  title: 'UD Document Intelligence — AI Analysis, Obligation Extraction & Risk Review',
  description:
    'Upload any .uds document and ask Claude AI to analyse it: extract obligations, identify risks, summarise key terms, and answer questions. Free tier available.',
  keywords:
    'document intelligence, AI document analysis, contract analysis AI, obligation extraction, document risk review, AI document review, Claude AI documents',
  openGraph: {
    title: 'UD Document Intelligence — AI Analysis & Obligation Extraction',
    description:
      'Upload a .uds document and ask Claude AI questions. Extract obligations, risks, and key terms automatically.',
    url: 'https://utilities.hive.baby/document-intelligence',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
