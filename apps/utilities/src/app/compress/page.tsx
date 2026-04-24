'use client'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Compress() {
  return (
    <>
      <ToolPage
        tool="compress"
        name="UD Compress"
        desc="Reduce PDF file size using object stream compression. No image quality loss."
        freeLabel="FREE · Unlimited"
      />
      <TooltipTour engineId="compress" tips={tourSteps['compress']} />
    </>
  )
}
