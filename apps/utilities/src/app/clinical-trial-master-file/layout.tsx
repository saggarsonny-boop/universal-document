import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UD Clinical Trial Master File — ICH GCP Compliant TMF as Governed Archive',
  description: 'Create ICH E6(R3) compliant Trial Master Files as tamper-evident governed archives. DIA TMF Reference Model sections. Fraction of Veeva Vault cost.',
  keywords: 'clinical trial master file, TMF software, ICH GCP TMF compliance, DIA TMF reference model, Veeva Vault alternative, Phlexglobal alternative, eTMF software, clinical trial document management, GCP document management',
  openGraph: {
    title: 'UD Clinical Trial Master File — ICH GCP Compliant TMF as Governed Archive',
    description: 'ICH E6(R3) compliant Trial Master Files as tamper-evident governed .udz archives. DIA TMF Reference Model.',
    url: 'https://utilities.hive.baby/clinical-trial-master-file',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
