import { AnimatedScenario } from '@/components/AnimatedScenario'
import { ScenarioPage } from '@/components/ScenarioPage'

export const metadata = { title: 'The Paper — Universal Document™' }

export default function ResearchPaperPage() {
  return (
    <>
      <div style={{ padding: '48px 24px 0', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        <AnimatedScenario scenario="research" autoplay={false} />
      </div>
      <ScenarioPage
        file="research-paper.md"
        backLabel="Back to scenarios"
        backHref="/scenarios"
      />
    </>
  )
}
