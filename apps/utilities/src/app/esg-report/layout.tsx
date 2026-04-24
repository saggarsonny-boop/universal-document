export const metadata = {
  title: 'UD ESG Report — Tamper-Evident ESG Reporting with Greenwashing Prevention',
  description:
    'Create sealed ESG reports with Scope 1, 2 and 3 emissions, carbon credit certificates, and blockchain provenance to prevent greenwashing. SHA-256 tamper-evident.',
  keywords:
    'ESG report, environmental social governance, Scope 1 2 3 emissions, carbon reporting, greenwashing prevention, sustainability report, tamper-evident ESG',
  openGraph: {
    title: 'UD ESG Report — Tamper-Evident ESG Reporting',
    description:
      'Sealed ESG reports with Scope 1/2/3 emissions, carbon credits, and SHA-256 provenance to prevent greenwashing.',
    url: 'https://utilities.hive.baby/esg-report',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
