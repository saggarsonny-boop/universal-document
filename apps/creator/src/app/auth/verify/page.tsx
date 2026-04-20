'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function AuthVerifyInner() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const session = params.get('session')
    const email = params.get('email')
    if (session && email) {
      localStorage.setItem('ud_creator_session', session)
      localStorage.setItem('ud_creator_email', email)
    }
    router.replace('/')
  }, [params, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <p style={{ color: 'var(--muted)', fontSize: 14 }}>Signing you in…</p>
    </div>
  )
}

export default function AuthVerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>Signing you in…</p>
      </div>
    }>
      <AuthVerifyInner />
    </Suspense>
  )
}
