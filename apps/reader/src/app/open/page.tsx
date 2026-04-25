'use client'

import { useEffect } from 'react'

export default function OpenPage() {
  useEffect(() => {
    if (!('launchQueue' in window)) {
      // File Handling API not supported — redirect home
      window.location.href = '/'
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).launchQueue.setConsumer(async (launchParams: any) => {
      if (!launchParams.files?.length) {
        window.location.href = '/'
        return
      }
      try {
        const file = await launchParams.files[0].getFile()
        const text = await file.text()
        // Validate it's JSON before storing
        JSON.parse(text)
        sessionStorage.setItem('ud_open_file', text)
        sessionStorage.setItem('ud_open_filename', file.name)
      } catch {
        sessionStorage.setItem('ud_open_error', 'Could not read file.')
      }
      window.location.href = '/?autoopen=1'
    })
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', color: 'var(--ud-muted)', fontSize: '0.95rem',
    }}>
      Opening document…
    </div>
  )
}
