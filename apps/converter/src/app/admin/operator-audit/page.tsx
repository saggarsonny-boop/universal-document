// /admin/operator-audit — read-only operator action ledger for UD Converter.
//
// Every operator-flagged action (conversion, override, login) is logged
// to converter_operator_audit. This page surfaces the most recent 100
// rows so Sonny can see who did what without going through psql. Auth
// gate matches the rest of the operator surface: signed `ud_operator`
// cookie, OR x-ud-operator-key header (CLI / curl). Clerk isn't wired
// for UD Converter today; the placeholder header path lets a future
// Clerk middleware short-circuit without code changes here.

import { headers, cookies } from 'next/headers'
import { timingSafeEqual } from 'crypto'
import { ensureSchema } from '@/lib/db'
import {
  OPERATOR_COOKIE_NAME,
  OPERATOR_HEADER_NAME,
  verifyOperatorToken,
} from '@/lib/operator-auth'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type AuditRow = {
  id: string
  user_identity: string
  action: string
  engine_slug: string
  file_size: number | string | null
  file_type: string | null
  request_id: string | null
  timestamp: string
}

type SearchParams = {
  from?: string | string[]
  to?: string | string[]
}

function param(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? ''
  return v ?? ''
}

function isYmd(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v)
}

async function isOperator(): Promise<boolean> {
  const h = await headers()
  // Clerk placeholder (matches checkOperator's path 1)
  if (h.get('x-clerk-user-role') === 'operator') return true
  // Header path
  const headerKey = h.get(OPERATOR_HEADER_NAME)
  const expected = process.env.OPERATOR_KEY
  if (headerKey && expected && headerKey.length === expected.length) {
    try {
      if (timingSafeEqual(Buffer.from(headerKey), Buffer.from(expected))) {
        return true
      }
    } catch {
      // length filtered above; any other error means malformed input
    }
  }
  // Cookie path
  const jar = await cookies()
  const raw = jar.get(OPERATOR_COOKIE_NAME)?.value
  if (raw && verifyOperatorToken(raw)) return true
  return false
}

const C = {
  page: { minHeight: '100vh', background: 'var(--ud-paper)', padding: '40px 24px 80px' } as React.CSSProperties,
  wrap: { maxWidth: 1080, margin: '0 auto' } as React.CSSProperties,
  back: { fontSize: 13, color: 'var(--ud-muted)', display: 'inline-block', marginBottom: 24, textDecoration: 'none' } as React.CSSProperties,
  h1: { fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: 'var(--ud-ink)', marginBottom: 6 } as React.CSSProperties,
  sub: { fontSize: 14, color: 'var(--ud-muted)', marginBottom: 28, lineHeight: 1.5 } as React.CSSProperties,
  card: { background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 12, padding: '20px 24px', marginBottom: 20 } as React.CSSProperties,
  filterRow: { display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' as const },
  label: { display: 'block', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4 },
  input: { minHeight: 40, padding: '8px 12px', fontSize: 14, border: '1px solid var(--ud-border)', borderRadius: 8, background: '#fff', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' } as React.CSSProperties,
  primaryBtn: { minHeight: 40, padding: '8px 18px', fontSize: 14, fontWeight: 600, color: '#fff', background: 'var(--ud-gold)', border: 'none', borderRadius: 8, cursor: 'pointer' } as React.CSSProperties,
  resetLink: { minHeight: 40, padding: '9px 18px', fontSize: 14, color: 'var(--ud-ink)', background: 'transparent', border: '1px solid var(--ud-border)', borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' } as React.CSSProperties,
  tableWrap: { overflowX: 'auto' as const, border: '1px solid var(--ud-border)', borderRadius: 12, background: '#fff' },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13, color: 'var(--ud-ink)', minWidth: 760 },
  th: { padding: '10px 12px', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--ud-muted)', fontWeight: 600, textAlign: 'left' as const, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' as const, borderBottom: '1px solid var(--ud-border)' },
  td: { padding: '10px 12px', verticalAlign: 'top' as const, whiteSpace: 'nowrap' as const, borderTop: '1px solid var(--ud-border)' },
  mono: { fontFamily: 'var(--font-mono)', fontSize: 12 },
  pill: { display: 'inline-block', fontSize: 11, color: 'var(--ud-gold-text)', border: '1px solid var(--ud-gold)', borderRadius: 6, padding: '1px 8px', letterSpacing: '0.04em', textTransform: 'uppercase' as const, fontFamily: 'var(--font-mono)' } as React.CSSProperties,
  empty: { padding: '32px 24px', color: 'var(--ud-muted)', textAlign: 'center' as const, background: '#fff', border: '1px solid var(--ud-border)', borderRadius: 12 },
}

export default async function OperatorAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const fromRaw = param(sp.from)
  const toRaw = param(sp.to)
  const from = fromRaw && isYmd(fromRaw) ? fromRaw : ''
  const to = toRaw && isYmd(toRaw) ? toRaw : ''

  const ok = await isOperator()
  if (!ok) {
    return (
      <div style={C.page}>
        <div style={C.wrap}>
          <a href="/" style={C.back}>← Converter</a>
          <h1 style={C.h1}>Not authorised</h1>
          <p style={C.sub}>
            This page is restricted to operators. Set the operator cookie via{' '}
            <code style={{ fontFamily: 'var(--font-mono)' }}>/api/operator/login</code>,{' '}
            or send the{' '}
            <code style={{ fontFamily: 'var(--font-mono)' }}>{OPERATOR_HEADER_NAME}</code> header.
          </p>
        </div>
      </div>
    )
  }

  // Schema is created on first write; ensureSchema() is idempotent and
  // makes the dashboard usable even on a fresh DB where no audit row
  // has ever been written. Failures are non-fatal — the SQL below will
  // throw with a clearer error if the table is genuinely missing.
  try { await ensureSchema() } catch (e) { console.warn('ensureSchema failed in operator-audit page:', e) }

  const sql = neon(process.env.DATABASE_URL!)
  const fromTs = from ? `${from}T00:00:00.000Z` : null
  const toTs = to ? `${to}T23:59:59.999Z` : null

  let rows: AuditRow[]
  if (fromTs && toTs) {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, file_size, file_type, request_id, timestamp
        FROM converter_operator_audit
       WHERE timestamp >= ${fromTs}::timestamptz
         AND timestamp <= ${toTs}::timestamptz
       ORDER BY timestamp DESC
       LIMIT 100
    `) as unknown as AuditRow[]
  } else if (fromTs) {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, file_size, file_type, request_id, timestamp
        FROM converter_operator_audit
       WHERE timestamp >= ${fromTs}::timestamptz
       ORDER BY timestamp DESC
       LIMIT 100
    `) as unknown as AuditRow[]
  } else if (toTs) {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, file_size, file_type, request_id, timestamp
        FROM converter_operator_audit
       WHERE timestamp <= ${toTs}::timestamptz
       ORDER BY timestamp DESC
       LIMIT 100
    `) as unknown as AuditRow[]
  } else {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, file_size, file_type, request_id, timestamp
        FROM converter_operator_audit
       ORDER BY timestamp DESC
       LIMIT 100
    `) as unknown as AuditRow[]
  }

  return (
    <div style={C.page}>
      <div style={C.wrap}>
        <a href="/" style={C.back}>← Converter</a>
        <h1 style={C.h1}>Operator audit</h1>
        <p style={C.sub}>
          Most recent 100 operator actions on UD Converter. Read-only —
          every operator-flagged action logs here.
        </p>

        <form method="get" action="/admin/operator-audit" style={C.card} aria-label="Filter audit rows by date">
          <div style={C.filterRow}>
            <div style={{ flex: '1 1 160px', minWidth: 140 }}>
              <label htmlFor="from" style={C.label}>From (UTC)</label>
              <input id="from" name="from" type="date" defaultValue={from} style={{ ...C.input, width: '100%' }} />
            </div>
            <div style={{ flex: '1 1 160px', minWidth: 140 }}>
              <label htmlFor="to" style={C.label}>To (UTC)</label>
              <input id="to" name="to" type="date" defaultValue={to} style={{ ...C.input, width: '100%' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" style={C.primaryBtn}>Apply</button>
              <a href="/admin/operator-audit" style={C.resetLink}>Reset</a>
            </div>
          </div>
        </form>

        <p style={{ ...C.sub, fontSize: 12, marginBottom: 12 }}>
          Showing <strong style={{ color: 'var(--ud-ink)' }}>{rows.length}</strong> row{rows.length === 1 ? '' : 's'}.
        </p>

        {rows.length === 0 ? (
          <div style={C.empty}>No audit rows for this filter.</div>
        ) : (
          <div style={C.tableWrap}>
            <table style={C.table}>
              <thead>
                <tr>
                  <th style={C.th}>Timestamp (UTC)</th>
                  <th style={C.th}>Operator</th>
                  <th style={C.th}>Action</th>
                  <th style={C.th}>Engine</th>
                  <th style={C.th}>File size</th>
                  <th style={C.th}>File type</th>
                  <th style={C.th}>Request ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td style={{ ...C.td, ...C.mono }}>{new Date(r.timestamp).toISOString().replace('T', ' ').slice(0, 19)}</td>
                    <td style={C.td}>{r.user_identity}</td>
                    <td style={C.td}><span style={C.pill}>{r.action}</span></td>
                    <td style={{ ...C.td, ...C.mono }}>{r.engine_slug}</td>
                    <td style={{ ...C.td, ...C.mono }}>{r.file_size != null ? formatBytes(Number(r.file_size)) : '—'}</td>
                    <td style={{ ...C.td, ...C.mono }}>{r.file_type ?? '—'}</td>
                    <td style={{ ...C.td, ...C.mono }}>{r.request_id ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`
}
