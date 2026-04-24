export const metadata = {
  title: 'UD Signing Workflow — Multi-Party Sequential & Parallel Document Signing',
  description:
    'Orchestrate multi-party document signing with sequential or parallel workflows. SHA-256 sealed at each signature. Tamper-evident audit trail. Pro tier.',
  keywords:
    'multi-party signing, document signing workflow, sequential signing, parallel signing, e-signature workflow, tamper-evident signing',
  openGraph: {
    title: 'UD Signing Workflow — Multi-Party Sequential & Parallel Signing',
    description:
      'Multi-party signing workflows with sequential or parallel order. SHA-256 sealed at each step with full audit trail.',
    url: 'https://utilities.hive.baby/signing-workflow',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
