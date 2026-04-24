export const metadata = {
  title: 'UD Consent Form — GDPR-Compliant Sealed Consent Documents',
  description:
    'Create tamper-evident consent forms for photo releases, model releases, data processing, and research participation. GDPR-compliant with SHA-256 provenance. Free.',
  keywords:
    'consent form, photo consent, model release, GDPR consent, data processing consent, research consent, tamper-evident consent document',
  openGraph: {
    title: 'UD Consent Form — GDPR-Compliant Sealed Consent Documents',
    description:
      'Photo consent, model release, data processing, and research participation consent forms. SHA-256 sealed, GDPR-compliant.',
    url: 'https://utilities.hive.baby/consent-form',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
