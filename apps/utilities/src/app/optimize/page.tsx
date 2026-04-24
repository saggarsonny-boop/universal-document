'use client'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Optimize() {
  return (
    <>
      <ToolPage
        tool="optimize"
        name="UD Optimize"
        desc="Restructure PDF internals for faster loading, web delivery, or archival. Removes redundant objects."
        freeLabel="FREE · Unlimited"
      />
      <TooltipTour engineId="optimize" tips={tourSteps['optimize']} />
    </>
  )
}
