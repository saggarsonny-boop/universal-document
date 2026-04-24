export const metadata = {
  title: 'UD Training Record — Tamper-Evident Training Certificates & CPD Records',
  description:
    'Create sealed training records and CPD certificates with SHA-256 provenance. Tamper-evident proof of competency for individuals and organisations. Free for individuals.',
  keywords:
    'training record, CPD certificate, continuing professional development, tamper-evident certificate, training completion record, competency record',
  openGraph: {
    title: 'UD Training Record — Tamper-Evident Training Certificates',
    description:
      'Sealed training records and CPD certificates with SHA-256 provenance. Proof of competency that cannot be falsified.',
    url: 'https://utilities.hive.baby/training-record',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
