import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Policy Publisher — Publish Structured Policy Documents with Version History and Review Dates',
  description: 'Create structured .uds policy documents with version tracking, mandatory review dates, owner attribution, and tamper-evident sealing. Replaces SharePoint and PolicyStat for organisations that need auditable policy records.',
  keywords: 'policy document tool, policy management software, structured policy document, policy version control, policy review date tracking, SharePoint policy alternative, PolicyStat alternative, organisational policy publisher, ISO policy document, compliance policy tool',
  openGraph: {
    title: 'UD Policy Publisher — Publish Structured Policy Documents with Version History and Review Dates',
    description: 'Structured policy documents with version tracking, review dates, owner attribution, and tamper-evident sealing.',
    url: 'https://utilities.hive.baby/policy-publisher',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
