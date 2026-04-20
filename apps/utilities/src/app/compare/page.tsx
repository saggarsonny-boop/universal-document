'use client'
import ToolPage from '@/components/ToolPage'

export default function Compare() {
  return (
    <ToolPage
      tool="compare"
      name="UD Compare"
      desc="AI-powered side-by-side comparison of two documents. Identifies additions, deletions, and wording changes."
      acceptMultiple
      freeLabel="AI · Free tier: 3/day"
    />
  )
}
