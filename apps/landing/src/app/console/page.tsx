'use client'

import { useState, useEffect, useCallback } from 'react'

interface Tester {
  id: number
  tester_id: string
  email: string
  name: string
  engine_slug: string
  engine_name: string
  email_verified: boolean
  created_at: string
  credit_earned_usd: number
  credit_granted_usd: number
  engines_tested: string[]
  notes: string | null
}

interface Slot {
  slug: string
  name: string
  current_testers: number
  max_testers: number
}

interface FeedbackRow {
  tester_id: string
  engine_slug: string
  submitted_at: string
  rating: number
}

interface ConsoleData {
  testers?: Tester[]
  slots?: Slot[]
  feedback?: FeedbackRow[]
  testerError?: string
  analytics?: Record<string, unknown>
  analyticsError?: string
}

const PROPERTIES = [
  'ud.hive.baby',
  'reader.hive.baby',
  'converter.hive.baby',
  'creator.hive.baby',
  'validator.hive.baby',
  'signer.hive.baby',
  'utilities.hive.baby',
  'test.hive.baby',
  'hivephoto.hive.baby',
]

export default function ConsolePage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [data, setData] = useState<ConsoleData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'testers' | 'analytics'>('overview')
  const [search, setSearch] = useState('')
  const [engineFilter, setEngineFilter] = useState('all')
  const [drawer, setDrawer] = useState<Tester | null>(null)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [noteText, setNoteText] = useState('')
  const [actionMsg, setActionMsg] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const load = useCallback(async (s: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/console/data', {
        headers: { 'x-admin-secret': s },
      })
      if (res.status === 401) { setError('Wrong password'); setLoading(false); return }
      const json = await res.json()
      setData(json)
      setAuthed(true)
      localStorage.setItem('hive_console_secret', s)
    } catch (e) {
      setError(String(e))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('hive_console_secret')
    if (saved) { setSecret(saved); load(saved) }
  }, [load])

  async function handleAction(action: string, payload: Record<string, unknown>) {
    setActionLoading(true)
    setActionMsg('')
    try {
      const res = await fetch('/api/console/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ action, ...payload }),
      })
      const json = await res.json()
      setActionMsg(json.ok ? 'Done.' : json.error || 'Error')
      if (json.ok) load(secret)
    } catch (e) {
      setActionMsg(String(e))
    }
    setActionLoading(false)
  }

  function exportCsv() {
    if (!data?.testers) return
    const cols = ['tester_id', 'email', 'name', 'engine_name', 'email_verified', 'created_at', 'credit_earned_usd', 'credit_granted_usd']
    const rows = [cols.join(','), ...data.testers.map(t =>
      cols.map(c => JSON.stringify((t as Record<string, unknown>)[c] ?? '')).join(',')
    )]
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `testers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 40, width: 360 }}>
          <div style={{ color: '#f0a500', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Hive Creator Console</div>
          <div style={{ color: '#8b949e', fontSize: 13, marginBottom: 24 }}>Admin access only</div>
          <input
            type="password"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(secret)}
            placeholder="Admin secret"
            style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', borderRadius: 8, color: '#e6edf3', padding: '10px 14px', fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
          />
          {error && <div style={{ color: '#f85149', fontSize: 12, marginTop: 8 }}>{error}</div>}
          <button
            onClick={() => load(secret)}
            disabled={loading}
            style={{ marginTop: 16, width: '100%', background: '#f0a500', color: '#000', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            {loading ? 'Loading…' : 'Enter'}
          </button>
        </div>
      </div>
    )
  }

  const testers = data?.testers || []
  const slots = data?.slots || []
  const feedback = data?.feedback || []

  const feedbackSet = new Set(feedback.map(f => `${f.tester_id}:${f.engine_slug}`))
  const pendingFeedback = testers.filter(t =>
    t.email_verified && !feedbackSet.has(`${t.tester_id}:${t.engine_slug}`)
  )

  const totalCredit = testers.reduce((s, t) => s + (t.credit_earned_usd || 0), 0)
  const totalGranted = testers.reduce((s, t) => s + (t.credit_granted_usd || 0), 0)

  const byEngine: Record<string, number> = {}
  testers.forEach(t => { byEngine[t.engine_name] = (byEngine[t.engine_name] || 0) + 1 })
  const topEngines = Object.entries(byEngine).sort((a, b) => b[1] - a[1])

  const filtered = testers.filter(t => {
    const q = search.toLowerCase()
    const matchSearch = !q || t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q) || t.tester_id?.toLowerCase().includes(q)
    const matchEngine = engineFilter === 'all' || t.engine_slug === engineFilter
    return matchSearch && matchEngine
  })

  const engineSlugs = [...new Set(testers.map(t => t.engine_slug))]

  const countryData = (() => {
    if (!data?.analytics) return {}
    const counts: Record<string, number> = {}
    Object.values(data.analytics).forEach(prop => {
      if (!prop || typeof prop !== 'object' || 'error' in (prop as object)) return
      const events = (prop as { events?: Array<{ country?: string }> }).events || []
      events.forEach(e => {
        if (e.country) counts[e.country] = (counts[e.country] || 0) + 1
      })
    })
    return counts
  })()

  const propVisitors: Record<string, number> = {}
  PROPERTIES.forEach(p => {
    const d = data?.analytics?.[p]
    if (d && typeof d === 'object' && !('error' in (d as object))) {
      const events = (d as { events?: unknown[] }).events
      propVisitors[p] = Array.isArray(events) ? events.length : 0
    }
  })
  const maxVisitors = Math.max(...Object.values(propVisitors), 1)

  const topCountries = Object.entries(countryData).sort((a, b) => b[1] - a[1]).slice(0, 10)
  const maxCountry = topCountries[0]?.[1] || 1

  const s: Record<string, React.CSSProperties> = {
    page: { minHeight: '100vh', background: '#0d1117', color: '#e6edf3', fontFamily: 'var(--font-mono, monospace)' },
    header: { background: '#161b22', borderBottom: '1px solid #30363d', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 24 },
    title: { color: '#f0a500', fontSize: 16, fontWeight: 700, letterSpacing: '0.05em' },
    tab: (active: boolean): React.CSSProperties => ({
      padding: '6px 16px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
      background: active ? '#f0a500' : 'transparent',
      color: active ? '#000' : '#8b949e',
      border: 'none', fontWeight: active ? 700 : 400
    }),
    body: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
    card: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 24, marginBottom: 24 },
    label: { color: '#8b949e', fontSize: 11, textTransform: 'uppercase' as const, letterSpacing: '0.1em', marginBottom: 4 },
    value: { color: '#e6edf3', fontSize: 32, fontWeight: 700 },
    sub: { color: '#8b949e', fontSize: 13 },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
    statCard: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, padding: 20 },
    bar: (pct: number, color: string): React.CSSProperties => ({
      height: 8, borderRadius: 4, background: color, width: `${pct}%`
    }),
    row: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #21262d' },
    badge: (ok: boolean): React.CSSProperties => ({
      fontSize: 11, padding: '2px 8px', borderRadius: 4,
      background: ok ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
      color: ok ? '#3fb950' : '#f85149'
    }),
    input: { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', padding: '8px 12px', fontSize: 13, width: '100%', boxSizing: 'border-box' as const, outline: 'none' },
    btn: (color: string): React.CSSProperties => ({
      background: color, color: color === '#f0a500' ? '#000' : '#fff',
      border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, cursor: 'pointer', fontWeight: 600
    }),
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.title}>Hive Creator Console</div>
        <div style={{ flex: 1 }} />
        <button style={s.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Overview</button>
        <button style={s.tab(activeTab === 'testers')} onClick={() => setActiveTab('testers')}>Testers</button>
        <button style={s.tab(activeTab === 'analytics')} onClick={() => setActiveTab('analytics')}>Analytics</button>
        <button onClick={() => load(secret)} style={{ ...s.btn('#21262d'), fontSize: 12 }}>↻ Refresh</button>
        <button onClick={() => { localStorage.removeItem('hive_console_secret'); setAuthed(false) }} style={{ ...s.btn('#21262d'), fontSize: 12 }}>Sign out</button>
      </div>

      <div style={s.body}>
        {activeTab === 'overview' && (
          <>
            <div style={s.grid3}>
              {[
                { label: 'Total Testers', value: testers.length, sub: `${testers.filter(t => t.email_verified).length} verified` },
                { label: 'Credit Earned', value: `$${totalCredit}`, sub: `$${totalGranted} granted` },
                { label: 'Feedback Submitted', value: feedback.length, sub: `${pendingFeedback.length} pending` },
                { label: 'Slots Filling', value: `${slots.filter(s => s.current_testers > 0).length}/${slots.length}`, sub: 'engines active' },
              ].map(({ label, value, sub }) => (
                <div key={label} style={s.statCard}>
                  <div style={s.label}>{label}</div>
                  <div style={s.value}>{value}</div>
                  <div style={s.sub}>{sub}</div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={{ ...s.label, marginBottom: 16 }}>Signups by Engine</div>
              {topEngines.map(([name, count]) => (
                <div key={name} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{name}</span><span style={{ color: '#8b949e' }}>{count}</span>
                  </div>
                  <div style={{ background: '#21262d', borderRadius: 4, height: 6 }}>
                    <div style={s.bar(Math.round(count / Math.max(...topEngines.map(e => e[1])) * 100), '#f0a500')} />
                  </div>
                </div>
              ))}
            </div>

            <div style={s.card}>
              <div style={{ ...s.label, marginBottom: 16 }}>Engine Slot Status</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {slots.map(slot => (
                  <div key={slot.slug} style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>{slot.name}</div>
                    <div style={{ background: '#21262d', borderRadius: 4, height: 6, marginBottom: 4 }}>
                      <div style={s.bar(Math.round(slot.current_testers / slot.max_testers * 100), slot.current_testers >= slot.max_testers ? '#f85149' : '#3fb950')} />
                    </div>
                    <div style={{ color: '#8b949e', fontSize: 11 }}>{slot.current_testers}/{slot.max_testers}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={s.label}>Recent Tester Signups</div>
              </div>
              {testers.slice(0, 10).map(t => (
                <div key={t.id} style={s.row}>
                  <span style={{ color: '#f0a500', fontSize: 12, width: 100 }}>{t.tester_id}</span>
                  <span style={{ flex: 1, fontSize: 13 }}>{t.name || t.email}</span>
                  <span style={{ color: '#8b949e', fontSize: 12, width: 140 }}>{t.engine_name}</span>
                  <span style={s.badge(t.email_verified)}>{t.email_verified ? 'verified' : 'pending'}</span>
                  <span style={{ color: '#8b949e', fontSize: 11, width: 100 }}>{new Date(t.created_at).toLocaleDateString()}</span>
                  <button onClick={() => { setDrawer(t); setNoteText(t.notes || '') }} style={{ ...s.btn('#21262d'), padding: '4px 10px', fontSize: 11 }}>View</button>
                </div>
              ))}
            </div>

            {pendingFeedback.length > 0 && (
              <div style={s.card}>
                <div style={{ ...s.label, marginBottom: 16, color: '#f85149' }}>Outstanding Feedback ({pendingFeedback.length})</div>
                {pendingFeedback.slice(0, 15).map(t => (
                  <div key={`${t.id}-pf`} style={s.row}>
                    <span style={{ color: '#f0a500', fontSize: 12, width: 100 }}>{t.tester_id}</span>
                    <span style={{ flex: 1, fontSize: 13 }}>{t.name || t.email}</span>
                    <span style={{ color: '#8b949e', fontSize: 12, width: 140 }}>{t.engine_name}</span>
                    <span style={{ color: '#8b949e', fontSize: 11 }}>Signed up {new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'testers' && (
          <>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <input
                style={{ ...s.input, maxWidth: 280 }}
                placeholder="Search name, email, tester ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select
                style={{ ...s.input, maxWidth: 200 }}
                value={engineFilter}
                onChange={e => setEngineFilter(e.target.value)}
              >
                <option value="all">All engines</option>
                {engineSlugs.map(slug => {
                  const t = testers.find(t => t.engine_slug === slug)
                  return <option key={slug} value={slug}>{t?.engine_name || slug}</option>
                })}
              </select>
              <button onClick={exportCsv} style={s.btn('#21262d')}>Export CSV</button>
              <span style={{ color: '#8b949e', fontSize: 13 }}>{filtered.length} results</span>
            </div>

            <div style={s.card}>
              <div style={{ ...s.row, borderBottom: '1px solid #30363d', paddingBottom: 8, marginBottom: 4 }}>
                <span style={{ color: '#8b949e', fontSize: 11, width: 100 }}>ID</span>
                <span style={{ color: '#8b949e', fontSize: 11, flex: 1 }}>Name / Email</span>
                <span style={{ color: '#8b949e', fontSize: 11, width: 140 }}>Engine</span>
                <span style={{ color: '#8b949e', fontSize: 11, width: 60 }}>Status</span>
                <span style={{ color: '#8b949e', fontSize: 11, width: 80 }}>Credit</span>
                <span style={{ color: '#8b949e', fontSize: 11, width: 90 }}>Signed up</span>
                <span style={{ width: 50 }} />
              </div>
              {filtered.map(t => (
                <div key={t.id} style={s.row}>
                  <span style={{ color: '#f0a500', fontSize: 12, width: 100 }}>{t.tester_id}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{t.name || '—'}</div>
                    <div style={{ color: '#8b949e', fontSize: 11 }}>{t.email}</div>
                  </div>
                  <span style={{ color: '#8b949e', fontSize: 12, width: 140 }}>{t.engine_name}</span>
                  <span style={s.badge(t.email_verified)}>{t.email_verified ? '✓' : '!'}</span>
                  <span style={{ fontSize: 12, width: 80 }}>
                    ${t.credit_earned_usd || 0}
                    {(t.credit_granted_usd || 0) > 0 && <span style={{ color: '#3fb950' }}> ✓</span>}
                  </span>
                  <span style={{ color: '#8b949e', fontSize: 11, width: 90 }}>{new Date(t.created_at).toLocaleDateString()}</span>
                  <button onClick={() => { setDrawer(t); setNoteText(t.notes || ''); setActionMsg('') }} style={{ ...s.btn('#21262d'), padding: '4px 10px', fontSize: 11 }}>View</button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            {data?.analyticsError && (
              <div style={{ ...s.card, borderColor: '#f85149', color: '#f85149' }}>
                Analytics unavailable: {data.analyticsError}. Set VERCEL_TOKEN in ud.hive.baby Vercel env vars.
              </div>
            )}

            {data?.analytics && (
              <>
                <div style={s.card}>
                  <div style={{ ...s.label, marginBottom: 16 }}>Visitors by Property (30 days)</div>
                  {PROPERTIES.map(p => {
                    const v = propVisitors[p] || 0
                    const d = data.analytics?.[p]
                    const hasError = d && typeof d === 'object' && 'error' in (d as object)
                    return (
                      <div key={p} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>{p}</span>
                          <span style={{ color: hasError ? '#f85149' : '#8b949e' }}>
                            {hasError ? `Error (no project ID configured)` : v}
                          </span>
                        </div>
                        {!hasError && (
                          <div style={{ background: '#21262d', borderRadius: 4, height: 6 }}>
                            <div style={s.bar(Math.round(v / maxVisitors * 100), '#3b82f6')} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div style={{ color: '#8b949e', fontSize: 11, marginTop: 12 }}>
                    Note: Set VERCEL_PROJECT_* env vars in ud.hive.baby to activate per-property analytics.
                  </div>
                </div>

                {topCountries.length > 0 && (
                  <div style={s.card}>
                    <div style={{ ...s.label, marginBottom: 16 }}>Top Countries (all properties, 30 days)</div>
                    {topCountries.map(([country, count]) => (
                      <div key={country} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                          <span>{country}</span><span style={{ color: '#8b949e' }}>{count}</span>
                        </div>
                        <div style={{ background: '#21262d', borderRadius: 4, height: 6 }}>
                          <div style={s.bar(Math.round(count / maxCountry * 100), '#6366f1')} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {drawer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 480, background: '#161b22', borderLeft: '1px solid #30363d', padding: 32, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ color: '#f0a500', fontWeight: 700 }}>{drawer.tester_id}</div>
                <div style={{ color: '#8b949e', fontSize: 13 }}>{drawer.engine_name}</div>
              </div>
              <button onClick={() => setDrawer(null)} style={{ ...s.btn('#21262d'), fontSize: 18, padding: '4px 10px' }}>×</button>
            </div>

            <div style={{ marginBottom: 24 }}>
              {[
                ['Name', drawer.name || '—'],
                ['Email', drawer.email],
                ['Status', drawer.email_verified ? 'Email verified' : 'Awaiting verification'],
                ['Credit earned', `$${drawer.credit_earned_usd || 0}`],
                ['Credit granted', `$${drawer.credit_granted_usd || 0}`],
                ['Engines tested', Array.isArray(drawer.engines_tested) ? drawer.engines_tested.join(', ') || '—' : '—'],
                ['Joined', new Date(drawer.created_at).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #21262d', fontSize: 13 }}>
                  <span style={{ color: '#8b949e' }}>{k}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={s.label}>Grant Credit</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  style={{ ...s.input, width: 80 }}
                  placeholder="$USD"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value)}
                />
                <input
                  style={s.input}
                  placeholder="Reason"
                  value={creditReason}
                  onChange={e => setCreditReason(e.target.value)}
                />
              </div>
              <button
                onClick={() => handleAction('grant-credit', { testerId: drawer.tester_id, amountUsd: Number(creditAmount), reason: creditReason })}
                disabled={actionLoading || !creditAmount}
                style={{ ...s.btn('#f0a500'), marginTop: 8 }}
              >
                Grant
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={s.label}>Admin Note</div>
              <textarea
                style={{ ...s.input, marginTop: 8, height: 80, resize: 'vertical' as const }}
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <button
                onClick={() => handleAction('add-note', { testerId: drawer.tester_id, note: noteText })}
                disabled={actionLoading}
                style={{ ...s.btn('#21262d'), marginTop: 8 }}
              >
                Save Note
              </button>
            </div>

            {actionMsg && (
              <div style={{ fontSize: 13, color: actionMsg === 'Done.' ? '#3fb950' : '#f85149', marginTop: 8 }}>
                {actionMsg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
