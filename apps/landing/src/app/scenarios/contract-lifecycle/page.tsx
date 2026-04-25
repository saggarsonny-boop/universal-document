import { AnimatedScenario } from '@/components/AnimatedScenario'
import { ScenarioPage } from '@/components/ScenarioPage'

export const metadata = { title: 'The Lease — Universal Document™' }

export default function ContractLifecyclePage() {
  return (
    <>
      <div style={{ padding: '48px 24px 0', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <AnimatedScenario scenario="contract" autoplay={false} />
      </div>
      <ScenarioPage
        file="contract-lifecycle.md"
        backLabel="Back to scenarios"
        backHref="/scenarios"
      />
    </>
  )
}
