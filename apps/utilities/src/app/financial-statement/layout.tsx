import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Financial Statement — Structured Financial Document with Tamper-Evident Audit Trail',
  description: 'Package financial statements into a structured .uds with period, preparer, auditor status, and tamper-evident sealing. Suitable for management accounts, investor reporting, and audit submission.',
  keywords: 'financial statement document, structured financial report, tamper-evident financial statement, management accounts tool, investor report document, audit trail financial, XBRL alternative, Excel financial alternative, financial document management, auditor submission tool',
  openGraph: {
    title: 'UD Financial Statement — Structured Financial Document with Tamper-Evident Audit Trail',
    description: 'Structured .uds financial statements with period, preparer details, auditor status, and tamper-evident sealing.',
    url: 'https://utilities.hive.baby/financial-statement',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
