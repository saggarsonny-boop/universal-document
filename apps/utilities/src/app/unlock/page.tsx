'use client'
import { useState } from 'react'
import ToolPage from '@/components/ToolPage'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

export default function Unlock() {
  const [password, setPassword] = useState('')
  return (
    <>
      <ToolPage
        tool="unlock"
        name="UD Unlock"
        desc="Remove password protection from a PDF you own. Enter the current password to unlock."
        freeLabel="FREE · Unlimited"
        extraData={{ password }}
        extraFields={
          <div>
            <label style={{ display: 'block', fontSize: 13, color: 'var(--ud-muted)', marginBottom: 8 }}>
              Current password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter current password"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
              }}
            />
          </div>
        }
      />
      <TooltipTour engineId="unlock" tips={tourSteps['unlock']} />
    </>
  )
}
