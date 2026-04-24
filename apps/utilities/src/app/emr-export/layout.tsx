import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD EMR Export — Convert HL7, FHIR, C-CDA Records to Universal Document™',
  description: 'Convert any electronic medical record to a structured, multilingual, tamper-evident Universal Document™ file. HL7, FHIR, C-CDA, CCD supported. Enterprise tier.',
  keywords: 'HL7 to PDF alternative, FHIR document export, C-CDA converter, EHR interoperability, electronic medical record format, NHS FHIR records, Epic export tool',
  openGraph: {
    title: 'UD EMR Export — Convert HL7, FHIR, C-CDA Records to Universal Document™',
    description: 'Convert any electronic medical record to a structured, multilingual, tamper-evident Universal Document™ file. HL7, FHIR, C-CDA, CCD supported.',
    url: 'https://utilities.hive.baby/emr-export',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
