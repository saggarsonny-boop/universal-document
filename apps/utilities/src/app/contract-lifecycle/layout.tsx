export const metadata = {
  title: 'UD Contract Lifecycle — End-to-End CLM Pipeline with Tamper-Evident Audit Trail',
  description:
    'Manage the full contract lifecycle — draft, review, negotiate, execute, and archive — with a tamper-evident audit trail at every stage. Enterprise CLM pipeline.',
  keywords:
    'contract lifecycle management, CLM, contract management, contract pipeline, tamper-evident contracts, contract audit trail, enterprise contract management',
  openGraph: {
    title: 'UD Contract Lifecycle — End-to-End CLM Pipeline',
    description:
      'Full contract lifecycle management with tamper-evident audit trail at every stage — from draft to archive. Enterprise tier.',
    url: 'https://utilities.hive.baby/contract-lifecycle',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
