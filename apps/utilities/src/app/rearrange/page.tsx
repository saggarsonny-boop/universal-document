'use client'
import { useState } from 'react'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Rearrange() {
  const [order, setOrder] = useState('')
  return (
    <>
      <ToolPage
        tool="rearrange"
        name="UD Rearrange"
        desc="Reorder pages in any sequence. Enter the new page order as comma-separated numbers."
        freeLabel="FREE · Unlimited"
        extraData={{ order }}
        extraFields={
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8892a4', marginBottom: 8 }}>
              New page order (e.g. 3,1,2,4 — leave blank to reverse)
            </label>
            <input
              value={order}
              onChange={e => setOrder(e.target.value)}
              placeholder="3, 1, 2, 4"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
              }}
            />
          </div>
        }
      />
      <TooltipTour engineId="rearrange" tips={tourSteps['rearrange']} />
    </>
  )
}
