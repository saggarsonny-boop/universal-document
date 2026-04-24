import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Bates Stamp — Apply Sequential Bates Numbers to Documents for Litigation',
  description: 'Apply sequential Bates numbers to multiple documents instantly. Outputs a structured .udz bundle with each document numbered and indexed. Free, browser-only — no Adobe Acrobat required.',
  keywords: 'Bates stamping tool, Bates numbering documents, litigation Bates stamp, document Bates number, discovery Bates numbering, Adobe Acrobat Bates alternative, legal document numbering, court document numbering, e-discovery Bates stamp, Bates range generator',
  openGraph: {
    title: 'UD Bates Stamp — Apply Sequential Bates Numbers to Documents for Litigation',
    description: 'Sequential Bates numbering across multiple documents, outputting a structured .udz bundle. Free, browser-only, no Adobe required.',
    url: 'https://utilities.hive.baby/bates-stamp',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
