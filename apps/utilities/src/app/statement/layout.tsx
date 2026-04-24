import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Statement — Tamper-Evident Formal Statements and Apologies',
  description: 'Create formally structured, tamper-evident statements and apologies. Once sealed the statement cannot be altered. Blockchain timestamp proves when it was made. Free for 3/month.',
  keywords: 'formal statement maker, public apology document, press release tamper-evident, personal declaration, statement of intent, verified statement, notarized statement alternative',
  openGraph: {
    title: 'UD Statement — Tamper-Evident Formal Statements and Apologies',
    description: 'Formally structured, tamper-evident statements. Blockchain timestamp proves when the statement was made.',
    url: 'https://utilities.hive.baby/statement',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
