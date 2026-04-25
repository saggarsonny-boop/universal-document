import { notFound } from 'next/navigation'
import { getDocumentRecord, ensureRegistrySchema } from '@shared/lib/registry'

export const dynamic = 'force-dynamic'

interface Props {
  params: { id: string }
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'medium', timeZone: 'UTC' }) + ' UTC'
}

function StatusRow({ label, pass, detail }: { label: string; pass: boolean | null; detail?: string }) {
  const color = pass === null ? '#6b7280' : pass ? '#059669' : '#dc2626'
  const mark = pass === null ? '○' : pass ? '✓' : '✗'
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'monospace', minWidth: 16 }}>{mark}</span>
      <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{label}</span>
      {detail && <span style={{ fontSize: 13, color: '#6b7280', marginLeft: 'auto' }}>{detail}</span>}
    </div>
  )
}

export default async function VerifyPage({ params }: Props) {
  const { id } = params
  if (!id || !/^[a-f0-9-]{8,}$/i.test(id)) notFound()

  let record = null
  try {
    await ensureRegistrySchema()
    record = await getDocumentRecord(id)
  } catch {}

  const notRegistered = !record

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' }}>
      <a href="https://ud.hive.baby" style={{ fontSize: 13, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, textDecoration: 'none' }}>
        ← Universal Document™
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: notRegistered ? '#f59e0b' : record?.revoked ? '#dc2626' : '#059669' }} />
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 }}>
          {notRegistered ? 'Document not in registry' : record?.revoked ? 'Document revoked' : 'Document verified'}
        </h1>
      </div>

      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 32 }}>
        Universal Document™ provenance registry · Independent verification
      </p>

      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
        {notRegistered ? (
          <StatusRow label="Not registered in provenance registry" pass={false} detail="Document was not sealed via UD infrastructure" />
        ) : (
          <>
            <StatusRow label="Registered in provenance registry" pass={true} detail={fmt(record!.sealed_at)} />
            <StatusRow label={record!.revoked ? 'Revoked' : 'Not revoked'} pass={!record!.revoked} detail={record!.revoked ? fmt(record!.revoked_at) : undefined} />
            <StatusRow
              label={record!.blockchain_tx ? 'Bitcoin anchor proof available' : 'Bitcoin anchor pending'}
              pass={record!.blockchain_tx ? true : null}
              detail={record!.blockchain_tx ? 'OpenTimestamps OTS proof stored' : 'Anchoring in progress'}
            />
          </>
        )}
      </div>

      {record && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Document Record</h2>
          {record.title && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>Title</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{record.title}</div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>Document ID</div>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all' }}>{record.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>Sealed</div>
              <div style={{ fontSize: 13, color: '#374151' }}>{fmt(record.sealed_at)}</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>SHA-256 hash</div>
            <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151', wordBreak: 'break-all', background: '#f9fafb', padding: '6px 8px', borderRadius: 6 }}>{record.hash}</div>
          </div>
        </div>
      )}

      {record && record.events && record.events.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Custody Events</h2>
          {record.events.map((ev, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: i < record!.events.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: '#6b7280', minWidth: 70 }}>{ev.event}</span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{fmt(ev.ts)}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6 }}>
        Universal Document™ provenance registry · No ads · No investors · No agenda<br />
        Verify independently — the hash in the document seal must match the hash above.
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `Document Verification — ${params.id.slice(0, 8)}… · Universal Document™`,
    description: 'Independent provenance verification for Universal Document™ files. Check registration, hash integrity, and revocation status.',
  }
}
