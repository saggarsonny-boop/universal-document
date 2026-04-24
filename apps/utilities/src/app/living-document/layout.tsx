export const metadata = {
  title: 'UD Living Document — Version-Tracked Documents with Immutable Snapshots',
  description:
    'Create version-tracked .udr living documents. Edit freely, then snapshot any version as a sealed immutable .uds. Full revision history, never lose earlier versions.',
  keywords:
    'living document, version control document, collaborative document, document versioning, immutable document snapshot, tamper-evident document',
  openGraph: {
    title: 'UD Living Document — Version-Tracked with Immutable Snapshots',
    description:
      'Version-tracked .udr documents. Edit freely, export any version as a sealed .uds snapshot. Full history preserved.',
    url: 'https://utilities.hive.baby/living-document',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
