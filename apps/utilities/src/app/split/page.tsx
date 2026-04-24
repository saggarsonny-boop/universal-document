'use client'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Split() {
  return (
    <>
      <ToolPage
        tool="split"
        name="UD Split"
        desc="Split a PDF by page. Output returns each page as a separate file."
        freeLabel="FREE · Unlimited"
      />
      <TooltipTour engineId="split" tips={tourSteps['split']} />
    </>
  )
}
