'use client'
import { useState } from 'react'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Watermark() {
  const [watermarkText, setWatermarkText] = useState('UNIVERSAL DOCUMENT')
  return (
    <>
      <ToolPage
        tool="watermark"
        name="UD Watermark"
        desc="Add a diagonal text watermark to every page. UD-certified watermarks use the official dark-blue branding."
        freeLabel="FREE · Unlimited"
        extraData={{ watermarkText }}
        extraFields={
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 8 }}>
              Watermark text
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              {['UNIVERSAL DOCUMENT', 'CONFIDENTIAL', 'DRAFT', 'DO NOT COPY'].map(preset => (
                <button
                  key={preset}
                  onClick={() => setWatermarkText(preset)}
                  style={{
                    padding: '4px 10px', fontSize: 13, fontWeight: 600,
                    background: watermarkText === preset ? 'rgba(0,58,140,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${watermarkText === preset ? 'rgba(0,58,140,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 6, color: watermarkText === preset ? '#4DA3FF' : 'var(--ud-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {preset}
                </button>
              ))}
            </div>
            <input
              value={watermarkText}
              onChange={e => setWatermarkText(e.target.value)}
              placeholder="Custom text"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
              }}
            />
          </div>
        }
      />
      <TooltipTour engineId="watermark" tips={tourSteps['watermark']} />
    </>
  )
}
