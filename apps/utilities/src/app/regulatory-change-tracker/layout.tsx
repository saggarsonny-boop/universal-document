import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Regulatory Change Tracker — Monitor FDA, FCA, NHS Documents for Changes',
  description: 'Automatically detect changes in FDA guidance, FCA rules, NHS policies. Get a structured diff showing exactly what changed. Enterprise compliance monitoring tool.',
  keywords: 'regulatory change monitoring, FDA guidance tracker, FCA regulatory change alert, NHS policy change notification, regulatory intelligence software, compliance document monitoring, regulatory update tracker',
  openGraph: {
    title: 'UD Regulatory Change Tracker — Monitor FDA, FCA, NHS Documents for Changes',
    description: 'Structured diff showing exactly what changed in regulatory documents. Enterprise compliance monitoring.',
    url: 'https://utilities.hive.baby/regulatory-change-tracker',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
