import { headers } from 'next/headers'
import UDNav from '@/components/UDNav'
import UDFooter from '@/components/UDFooter'
import BetaBanner from '@/components/BetaBanner'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const isRegistry = headers().get('x-ud-registry') === '1'

  if (isRegistry) {
    return <main style={{ flex: 1 }}>{children}</main>
  }

  return (
    <>
      <UDNav engine="Universal Document™" />
      <BetaBanner />
      <main style={{ flex: 1 }}>{children}</main>
      <UDFooter />
    </>
  )
}
