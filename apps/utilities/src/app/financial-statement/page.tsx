'use client'
import { useState, useRef, useCallback } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

const STMT_TYPES = ['Income Statement','Balance Sheet','Cash Flow Statement','Statement of Changes in Equity','Management Accounts','Budget vs Actual','Other']

export default function FinancialStatement() {
  const [stmtType, setStmtType] = useState('')
  const [customType, setCustomType] = useState('')
  const [entityName, setEntityName] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [preparedBy, setPreparedBy] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((f: File | null) => { if (!f) return; setFile(f); setResult(null); setError('') }, [])
  const onDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }, [handleFile])

  const inp = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' as const }
  const lbl = { display: 'block' as const, fontSize: 11, fontWeight: 600 as const, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase' as const, letterSpacing: '0.08em', marginBottom: 6 }

  const run = async () => {
    if (!stmtType || !entityName) return
    setError(''); setResult(null)
    try {
      const now = new Date().toISOString()
      const type = stmtType === 'Other' ? customType : stmtType
      let rows: Record<string, unknown>[] = []
      if (file) {
        const text = await file.text()
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g,''))
          rows = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/"/g,''))
            const row: Record<string, unknown> = {}
            headers.forEach((h, i) => { row[h] = isNaN(Number(vals[i])) ? vals[i] : Number(vals[i]) })
            return row
          })
        }
      }
      const doc = {
        format: 'UDS', status: 'sealed',
        title: `${type} — ${entityName}${periodEnd ? ` (${periodEnd.slice(0,7)})` : ''}`,
        document_type: 'financial_statement',
        financial_statement: {
          type, entity: entityName, currency,
          period: periodStart && periodEnd ? { from: periodStart, to: periodEnd } : undefined,
          prepared_by: preparedBy || undefined,
          rows: rows.length ? rows : undefined,
          row_count: rows.length || undefined,
          source_file: file?.name || undefined,
        },
        provenance: { created_at: now, document_type: 'financial_statement', source_file: file?.name },
        _notice: 'This is not financial advice. Always review with a qualified accountant.',
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `${type.replace(/\s+/g,'-').toLowerCase()}-${entityName.replace(/\s+/g,'-').toLowerCase()}.uds` })
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed') }
  }

  const can = !stmtType || !entityName || (stmtType === 'Other' && !customType)

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Financial Statement</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>
      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>Package a financial statement as a structured .uds with queryable data rows, entity metadata, reporting period, and currency — numbers as data, not images.</p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>This is not financial advice. Always review with a qualified accountant.</div>

      <div style={{ border: `1.5px dashed ${dragging ? 'var(--ud-teal)' : 'var(--ud-border-2)'}`, borderRadius: 'var(--ud-radius-xl)', padding: '24px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'var(--ud-teal-2)' : 'var(--ud-paper-2)', transition: 'all 0.2s', marginBottom: 20 }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] ?? null)} />
        {file ? <div style={{ fontSize: 14, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>📊 {file.name} · <span style={{ color: 'var(--ud-teal)' }}>Click to replace</span></div>
          : <div><div style={{ fontSize: 24, marginBottom: 6 }}>📊</div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-ink)', fontFamily: 'var(--font-body)' }}>Drop CSV or XLSX (optional)</div><div style={{ fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)' }}>Data rows embedded as structured objects</div></div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
        <div>
          <label style={lbl}>Statement type *</label>
          <select value={stmtType} onChange={e => setStmtType(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            <option value="">— Select —</option>
            {STMT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Currency</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
            {['GBP','USD','EUR','AUD','CAD','JPY','CHF','SGD'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {stmtType === 'Other' && <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Statement type (specify)</label><input style={inp} value={customType} onChange={e => setCustomType(e.target.value)} placeholder="Type" /></div>}
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Entity name *</label><input style={inp} value={entityName} onChange={e => setEntityName(e.target.value)} placeholder="Company or organisation name" /></div>
        <div><label style={lbl}>Period — from</label><input type="date" style={inp} value={periodStart} onChange={e => setPeriodStart(e.target.value)} /></div>
        <div><label style={lbl}>Period — to</label><input type="date" style={inp} value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} /></div>
        <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Prepared by</label><input style={inp} value={preparedBy} onChange={e => setPreparedBy(e.target.value)} placeholder="Name or firm" /></div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: 'rgba(226,75,74,0.08)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontSize: 13, color: 'var(--ud-danger)', fontFamily: 'var(--font-body)', marginBottom: 20 }}>{error}</div>}
      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Statement packaged ✓</div><div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{entityName} · {stmtType === 'Other' ? customType : stmtType}</div></div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}
      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>Package Financial Statement</button>
      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Financial Statement differs from PDF and Excel</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>PDF financials are flat and unverifiable. Excel files can be changed without trace. UD Financial Statement creates a structured, tamper-evident record with chain of custody.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'PDF financial statement', body: 'A printed or exported PDF. No structured data fields, no machine-readable period or entity metadata. An auditor or investor can\'t verify it hasn\'t been modified after the preparer signed off.' },
            { title: 'Excel / Google Sheets', body: 'Editable after distribution. Cell formulas can be changed, figures amended, and dates altered with no audit trail. XLSX revision history is easily deleted and not cryptographically signed.' },
            { title: 'UD Financial Statement — structured period and entity metadata', body: 'Reporting period, entity name, preparer, and auditor status are structured fields — not text in a header. Any compliance tool, investor portal, or accounting system can read them programmatically.' },
            { title: 'UD Financial Statement — tamper-evident from preparation', body: 'The statement is sealed at the point of preparation. Any change to figures, dates, or entity details after sealing is detectable by UD Reader — providing independent assurance to auditors and investors.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="financial-statement" tips={tourSteps['financial-statement']} />
    </div>
  )
}
