import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Audit Trail — Generate a Tamper-Evident Document Audit Trail from Provenance Metadata',
  description: 'Extract and seal the full audit trail from any .uds document — creation, sealing, translation, classification, access events, and more. Outputs a verifiable .uds audit record. Free, browser-only.',
  keywords: 'document audit trail, tamper-evident audit log, document provenance viewer, chain of custody audit, document history tool, SharePoint audit alternative, DocuSign audit trail, compliance audit trail, document event log, audit trail generator',
  openGraph: {
    title: 'UD Audit Trail — Generate a Tamper-Evident Document Audit Trail from Provenance Metadata',
    description: 'Extract and seal the full audit trail from any .uds document — creation, sealing, translation, and more. Free, browser-only.',
    url: 'https://utilities.hive.baby/audit-trail',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
