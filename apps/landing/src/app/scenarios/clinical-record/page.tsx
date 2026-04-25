import { AnimatedScenario } from '@/components/AnimatedScenario'
import { ScenarioPage } from '@/components/ScenarioPage'

export const metadata = { title: 'The Discharge Summary — Universal Document™' }

export default function ClinicalRecordPage() {
  return (
    <>
      <div style={{ padding: '48px 24px 0', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <AnimatedScenario scenario="clinical" autoplay={false} />
      </div>
      <ScenarioPage
        file="clinical-record.md"
        backLabel="Back to scenarios"
        backHref="/scenarios"
      />
    </>
  )
}
