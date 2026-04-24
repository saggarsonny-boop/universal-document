'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const STATEMENT_TYPES = ['Formal Statement', 'Public Apology', 'Personal Declaration', 'Press Release', 'Statement of Intent', 'Denial / Correction', 'Witness Statement', 'Statutory Declaration']

export default function StatementPage() {
  const [statementType, setStatementType] = useState('Formal Statement')
  const [issuerName, setIssuerName] = useState('')
  const [issuerRole, setIssuerRole] = useState('')
  const [issuerOrg, setIssuerOrg] = useState('')
  const [statementTitle, setStatementTitle] = useState('')
  const [statementText, setStatementText] = useState('')
  const [statementDate, setStatementDate] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!issuerName.trim()) { setError('Issuer name is required.'); return }
    if (!statementText.trim()) { setError('Statement text is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const date = statementDate || now.slice(0, 10)
      const content = `${issuerName}|${statementType}|${statementText}|${date}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `stmt-${hash.slice(0, 16)}`, created: now, schema: 'statement',
        metadata: {
          statement_type: statementType, issuer: { name: issuerName, role: issuerRole || null, organisation: issuerOrg || null },
          title: statementTitle || `${statementType} — ${issuerName}`, statement_date: date,
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Statement' },
        content: [
          { type: 'heading', text: statementTitle || `${statementType} — ${issuerName}` },
          { type: 'paragraph', text: `Issued by: ${issuerName}${issuerRole ? `, ${issuerRole}` : ''}${issuerOrg ? `, ${issuerOrg}` : ''}` },
          { type: 'paragraph', text: `Type: ${statementType}` },
          { type: 'paragraph', text: `Date: ${date}` },
          { type: 'heading', level: 2, text: 'Statement' },
          { type: 'paragraph', text: statementText },
          { type: 'paragraph', text: `SHA-256: ${hash}` },
          { type: 'paragraph', text: 'This statement is tamper-evident and blockchain timestamped. Verify at utilities.hive.baby/verify.' },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = `${statementType.toLowerCase().replace(/\s+/g, '-')}-${issuerName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`
      setResult({ url: URL.createObjectURL(blob), name: `statement-${safeName.slice(0, 40)}.uds` })
    } catch {
      setError('Failed to generate statement.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="statement" tips={tourSteps['statement'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Statement</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 3/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create formally structured, tamper-evident statements and apologies. Once sealed the statement cannot be altered. Blockchain timestamp proves when it was made.
          </p>
        </div>

        <div data-tour="statement-type" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Statement Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Statement Type</label><select className={inp} value={statementType} onChange={e => setStatementType(e.target.value)}>{STATEMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
            <div><label className={lbl}>Date</label><input type="date" className={inp} value={statementDate} onChange={e => setStatementDate(e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Title (optional)</label><input className={inp} value={statementTitle} onChange={e => setStatementTitle(e.target.value)} placeholder="Auto-generated if blank" /></div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Issuer</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Name *</label><input className={inp} value={issuerName} onChange={e => setIssuerName(e.target.value)} /></div>
            <div><label className={lbl}>Role / Title</label><input className={inp} value={issuerRole} onChange={e => setIssuerRole(e.target.value)} /></div>
            <div><label className={lbl}>Organisation</label><input className={inp} value={issuerOrg} onChange={e => setIssuerOrg(e.target.value)} /></div>
          </div>
        </div>

        <div data-tour="statement-content" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Statement Text * <span style={{ color: '#c8960a', textTransform: 'none' }}>(SHA-256 sealed — cannot be altered after generation)</span></label>
          <textarea className={inp} rows={8} value={statementText} onChange={e => setStatementText(e.target.value)} placeholder="Write the full statement here..." style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Statement'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Statement Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Statement differs from a press release or email</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Cannot be backdated', body: 'The blockchain timestamp proves exactly when the statement was issued. Nobody can claim a statement was made before or after it actually was.' },
              { title: 'Tamper-evident text', body: 'The SHA-256 hash proves the exact words used. Accusations of misquotation are resolved by verifying the hash.' },
              { title: 'Formal structure', body: 'The statement type, issuer role, and organisation are embedded as structured data — not just text that can be misrepresented.' },
              { title: 'Portable proof', body: 'Share the .uds file directly. Anyone can verify the statement without contacting the issuer.' },
            ].map(c => (
              <div key={c.title} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
