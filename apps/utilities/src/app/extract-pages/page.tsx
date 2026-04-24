'use client'
import { useState } from 'react'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function ExtractPages() {
  const [pages, setPages] = useState('1-3')
  return (
    <>
      <ToolPage
        tool="extract-pages"
        name="UD Extract Pages"
        desc="Pull specific pages from any PDF. Supports ranges (1-5) and individual pages (1,3,7)."
        freeLabel="FREE · Unlimited"
        extraData={{ pages }}
        extraFields={
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8892a4', marginBottom: 8 }}>
              Pages to extract (e.g. 1-3, 5, 8-10)
            </label>
            <input
              value={pages}
              onChange={e => setPages(e.target.value)}
              placeholder="1-3, 5, 8"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
              }}
            />
          </div>
        }
      />
      <TooltipTour engineId="extract-pages" tips={tourSteps['extract-pages']} />
    </>
  )
}
