import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Deposition Package — Bundle Transcript and Exhibits into a Court-Ready .udz File',
  description: 'Package a deposition transcript with numbered exhibits into a single .udz bundle with chain of custody and cover sheet. Free, browser-only — no upload to any server.',
  keywords: 'deposition package tool, deposition transcript bundle, deposition exhibit bundling, court deposition package, litigation transcript tool, TrialDirector alternative, deposition management, deposition exhibit numbering, court exhibit package, deposition bundle creator',
  openGraph: {
    title: 'UD Deposition Package — Bundle Transcript and Exhibits into a Court-Ready .udz File',
    description: 'Deposition transcript + numbered exhibits in a single .udz bundle with chain of custody. Free, browser-only.',
    url: 'https://utilities.hive.baby/deposition-package',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
