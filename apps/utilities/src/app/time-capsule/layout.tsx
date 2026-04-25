import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Time Capsule — Seal Any Message or Document for the Future',
  description: 'Create a digital time capsule that unlocks on a future date. Letters to your children. Business plans. Future self messages. Sealed with tamper-evident seal. Free for 1 capsule per month.',
  keywords: 'digital time capsule, future message sealed document, letter to future self, document unlock future date, time capsule app free, message to children future, sealed document open later',
  openGraph: {
    title: 'UD Time Capsule — Seal Any Message or Document for the Future',
    description: 'Create a digital time capsule that unlocks on a future date. Sealed with tamper-evident seal.',
    url: 'https://utilities.hive.baby/time-capsule',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
