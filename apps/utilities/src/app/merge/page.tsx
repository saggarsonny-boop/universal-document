'use client'
import ToolPage from '@/components/ToolPage'

export default function Merge() {
  return (
    <ToolPage
      tool="merge"
      name="UD Merge"
      desc="Combine multiple PDFs into a single document. Drop files in order — output preserves sequence."
      acceptMultiple
      freeLabel="FREE · Unlimited"
    />
  )
}
