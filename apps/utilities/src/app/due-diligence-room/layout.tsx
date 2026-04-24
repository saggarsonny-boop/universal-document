import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Due Diligence Room — Virtual Data Room at a Fraction of Datasite Cost',
  description: 'Create M&A due diligence data rooms as tamper-evident governed archives. Dynamic watermarking, audit trails, auto-expiry on deal close. Datasite charges $10K/month. We don\'t.',
  keywords: 'virtual data room software, due diligence data room, M&A document management, Datasite alternative, Intralinks alternative, VDR software affordable, due diligence software, M&A document room',
  openGraph: {
    title: 'UD Due Diligence Room — Virtual Data Room at a Fraction of Datasite Cost',
    description: 'M&A due diligence data rooms as tamper-evident governed .udz archives with dynamic watermarking and auto-expiry.',
    url: 'https://utilities.hive.baby/due-diligence-room',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
