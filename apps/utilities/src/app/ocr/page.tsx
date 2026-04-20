'use client'
import ToolPage from '@/components/ToolPage'

export default function OCR() {
  return (
    <ToolPage
      tool="ocr"
      name="UD OCR"
      desc="Extract text from scanned PDFs and images using Claude AI. Preserves document structure."
      acceptTypes=".pdf,.png,.jpg,.jpeg,.tiff,.tif"
      freeLabel="AI · Free tier: 5/day"
    />
  )
}
