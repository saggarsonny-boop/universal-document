'use client'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Merge() {
  return (
    <>
      <ToolPage
        tool="merge"
        name="UD Merge"
        desc="Combine multiple PDFs into a single document. Drop files in order — output preserves sequence."
        acceptMultiple
        freeLabel="FREE · Unlimited"
      />
      <TooltipTour engineId="merge" tips={tourSteps['merge']} />
    </>
  )
}
