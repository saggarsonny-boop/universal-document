export const metadata = {
  title: 'UD Capture — Bulk Document Ingestion with AI Classification',
  description:
    'Ingest bulk documents, classify them with Claude AI, and produce a tamper-evident .udz bundle with auto-generated metadata. Enterprise-grade document capture.',
  keywords:
    'document capture, bulk document ingestion, AI document classification, document management, automated document processing, enterprise document capture',
  openGraph: {
    title: 'UD Capture — Bulk Document Ingestion with AI Classification',
    description:
      'Ingest and classify documents with Claude AI. Produce a tamper-evident .udz bundle with auto-generated metadata. Enterprise tier.',
    url: 'https://utilities.hive.baby/capture',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
