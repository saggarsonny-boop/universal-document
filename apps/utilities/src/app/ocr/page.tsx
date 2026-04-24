'use client'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function OCR() {
  return (
    <>
      <ToolPage
        tool="ocr"
        name="UD OCR"
        desc="Extract text from scanned documents and images. Images (PNG, JPG, TIFF) use Tesseract OCR. PDFs use Claude AI vision — works on both selectable and scanned pages."
        acceptTypes=".pdf,.png,.jpg,.jpeg,.tiff,.tif,.bmp,.webp"
        freeLabel="AI · Free tier: 5/day"
      />
      <TooltipTour engineId="ocr" tips={tourSteps['ocr']} />
    </>
  )
}
