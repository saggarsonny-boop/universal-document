export const metadata = {
  title: 'UD Proposal — Sealed Business Proposals with Executive, Detailed & Pricing Layers',
  description:
    'Create tamper-evident business proposals with executive summary, detailed scope, and pricing layers. SHA-256 sealed with expiry. Free tier available.',
  keywords:
    'business proposal, project proposal, tamper-evident proposal, executive summary, proposal document, scope of work proposal',
  openGraph: {
    title: 'UD Proposal — Sealed Business Proposals with Audience Layers',
    description:
      'Business proposals with executive, detailed, and pricing layers. SHA-256 tamper-evident with proposal expiry.',
    url: 'https://utilities.hive.baby/proposal',
    siteName: 'Universal Document™',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
