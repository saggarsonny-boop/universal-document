import fs from 'fs'
import path from 'path'
import { ScenarioPageClient } from './ScenarioPageClient'

export function ScenarioPage({ file, backLabel, backHref }: { file: string; backLabel: string; backHref: string }) {
  const mdPath = path.join(process.cwd(), 'public', 'scenarios', file)
  const md = fs.readFileSync(mdPath, 'utf-8')
  return <ScenarioPageClient md={md} backLabel={backLabel} backHref={backHref} />
}
