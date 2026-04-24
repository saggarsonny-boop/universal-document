export const metadata = {
  title: 'UD Document Vault — Organisation-Level Governed Document Storage',
  description:
    'Create a governed, tamper-evident document vault for organisations. Bundle, hash, and seal collections of .uds files into an auditable .udz archive with access policy metadata.',
  keywords:
    'document vault, governed document storage, enterprise document management, tamper-evident archive, document bundle, organisation document control',
  openGraph: {
    title: 'UD Document Vault — Organisation-Level Governed Storage',
    description:
      'Governed document vaults for organisations. Bundle .uds files into auditable .udz archives with access policy and retention metadata.',
    url: 'https://utilities.hive.baby/document-vault',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
