import type { Metadata } from 'next'
import RegistryNav from '@/components/registry/RegistryNav'
import RegistryFooter from '@/components/registry/RegistryFooter'
import { REGISTRY_SITE_URL } from '@/lib/registry/site'

export const metadata: Metadata = {
  title: 'Universal Document Schema Registry — Governance, Schemas, and Standards',
  description: 'The authoritative catalogue of JSON Schema definitions for Universal Document™. Governance model, registration process, versioning, licensing, and national PKI integration.',
  keywords: 'schema registry, universal document, JSON schema, document governance, UDF, CC BY 4.0, document standards',
  metadataBase: new URL(REGISTRY_SITE_URL),
  openGraph: {
    title: 'Universal Document Schema Registry',
    description: 'Governance, schemas, and standards for the Universal Document™ ecosystem.',
    url: REGISTRY_SITE_URL,
    siteName: 'Universal Document Schema Registry',
    type: 'website',
  },
}

export default function RegistryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RegistryNav />
      {children}
      <RegistryFooter />
    </>
  )
}
