import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Job Application — Tamper-Evident Job Application Package as .udz',
  description: 'Create a governed job application package as a .udz file — CV, cover letter, certificates, and references all in one tamper-evident bundle. Employers verify qualifications without contacting institutions.',
  keywords: 'job application bundle, tamper-evident CV, verified job application, employment document package, credential verification, reference letter bundle, application package',
  openGraph: {
    title: 'UD Job Application — Tamper-Evident Job Application Package',
    description: 'CV, cover letter, and certificates in one tamper-evident .udz bundle. Verify qualifications without institution contact.',
    url: 'https://utilities.hive.baby/job-application',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
