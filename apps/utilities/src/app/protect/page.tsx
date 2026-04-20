'use client'
import { useState } from 'react'
import ToolPage from '@/components/ToolPage'

export default function Protect() {
  const [password, setPassword] = useState('')
  return (
    <ToolPage
      tool="protect"
      name="UD Protect"
      desc="Add password protection to any PDF. Restricts copying, modification, and high-res printing."
      freeLabel="FREE · Unlimited"
      extraData={{ password }}
      extraFields={
        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#8892a4', marginBottom: 8 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            style={{
              width: '100%', padding: '10px 14px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8, color: '#f1f5f9', fontSize: 14, outline: 'none',
            }}
          />
          <p style={{ fontSize: 12, color: '#4a5568', marginTop: 6 }}>
            Files are processed in-memory. Your password is never stored.
          </p>
        </div>
      }
    />
  )
}
