'use client'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Redact() {
  return (
    <>
      <ToolPage
        tool="redact"
        name="UD Redact"
        desc="Permanently black out sensitive content. Redactions are burned in — not just visually hidden. Cannot be undone."
        freeLabel="Free · Irreversible"
      />
      <TooltipTour engineId="redact" tips={tourSteps['redact']} />
    </>
  )
}
