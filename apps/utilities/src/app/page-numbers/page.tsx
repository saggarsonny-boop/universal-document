'use client'
import { useState } from 'react'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function PageNumbers() {
  const [position, setPosition] = useState('bottom-center')
  const positions = ['bottom-center', 'bottom-left', 'bottom-right', 'top-center', 'top-left', 'top-right']
  return (
    <>
      <ToolPage
        tool="page-numbers"
        name="UD Page Numbers"
        desc="Add clean, customisable page numbers to any PDF. Choose position and starting number."
        freeLabel="FREE · Unlimited"
        extraData={{ position }}
        extraFields={
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 8 }}>
              Position
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {positions.map(p => (
                <button
                  key={p}
                  onClick={() => setPosition(p)}
                  style={{
                    padding: '6px 12px', fontSize: 13, fontWeight: 600,
                    background: position === p ? 'rgba(0,58,140,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${position === p ? 'rgba(0,58,140,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 6, color: position === p ? '#4DA3FF' : 'var(--ud-muted)',
                    cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {p.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
        }
      />
      <TooltipTour engineId="page-numbers" tips={tourSteps['page-numbers']} />
    </>
  )
}
