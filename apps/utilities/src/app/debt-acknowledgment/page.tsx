'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function DebtAcknowledgmentPage() {
  const [debtorName, setDebtorName] = useState('')
  const [debtorAddress, setDebtorAddress] = useState('')
  const [creditorName, setCreditorName] = useState('')
  const [creditorAddress, setCreditorAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [originalDate, setOriginalDate] = useState('')
  const [description, setDescription] = useState('')
  const [repaymentSchedule, setRepaymentSchedule] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [repaymentDeadline, setRepaymentDeadline] = useState('')
  const [defaultTerms, setDefaultTerms] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!debtorName.trim() || !creditorName.trim()) { setError('Debtor and creditor names are required.'); return }
    if (!amount) { setError('Debt amount is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${debtorName}|${creditorName}|${amount}|${currency}|${description}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `debt-${hash.slice(0, 16)}`, created: now, schema: 'debt_acknowledgment',
        expires: repaymentDeadline || undefined,
        metadata: {
          debtor: { name: debtorName, address: debtorAddress || null },
          creditor: { name: creditorName, address: creditorAddress || null },
          debt: { amount: parseFloat(amount), currency, description: description || null, original_date: originalDate || null },
          repayment: { schedule: repaymentSchedule || null, interest_rate: interestRate ? parseFloat(interestRate) : null, deadline: repaymentDeadline || null, default_terms: defaultTerms || null },
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Debt Acknowledgment' },
        content: [
          { type: 'heading', text: 'Debt Acknowledgment' },
          { type: 'paragraph', text: `Debtor: ${debtorName}${debtorAddress ? `, ${debtorAddress}` : ''}` },
          { type: 'paragraph', text: `Creditor: ${creditorName}${creditorAddress ? `, ${creditorAddress}` : ''}` },
          { type: 'paragraph', text: `Amount: ${currency} ${parseFloat(amount).toFixed(2)}` },
          ...(description ? [{ type: 'paragraph', text: `For: ${description}` }] : []),
          ...(originalDate ? [{ type: 'paragraph', text: `Original debt date: ${originalDate}` }] : []),
          ...(repaymentSchedule ? [{ type: 'heading', level: 2, text: 'Repayment Terms' }, { type: 'paragraph', text: repaymentSchedule }] : []),
          ...(interestRate ? [{ type: 'paragraph', text: `Interest: ${interestRate}% per annum` }] : []),
          ...(repaymentDeadline ? [{ type: 'paragraph', text: `Repayment deadline: ${repaymentDeadline}` }] : []),
          ...(defaultTerms ? [{ type: 'heading', level: 2, text: 'Default' }, { type: 'paragraph', text: defaultTerms }] : []),
          { type: 'paragraph', text: `SHA-256: ${hash}` },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = `${debtorName}-${creditorName}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 30)
      setResult({ url: URL.createObjectURL(blob), name: `debt-ack-${safeName}.uds` })
    } catch {
      setError('Failed to generate debt acknowledgment.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="debt-acknowledgment" tips={tourSteps['debt-acknowledgment'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Debt Acknowledgment</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 3/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a tamper-evident debt acknowledgment between two parties. Cannot be altered after sealing. The IOU that actually holds up — with cryptographic timestamp proving when it was agreed.
          </p>
        </div>

        <div data-tour="parties" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Parties</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Debtor Name *</label><input className={inp} value={debtorName} onChange={e => setDebtorName(e.target.value)} placeholder="Person who owes the money" /></div>
            <div><label className={lbl}>Creditor Name *</label><input className={inp} value={creditorName} onChange={e => setCreditorName(e.target.value)} placeholder="Person owed the money" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Debtor Address</label><input className={inp} value={debtorAddress} onChange={e => setDebtorAddress(e.target.value)} /></div>
            <div><label className={lbl}>Creditor Address</label><input className={inp} value={creditorAddress} onChange={e => setCreditorAddress(e.target.value)} /></div>
          </div>
        </div>

        <div data-tour="debt-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Debt Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Amount *</label><input className={inp} value={amount} onChange={e => setAmount(e.target.value)} placeholder="1000.00" /></div>
            <div><label className={lbl}>Currency</label><select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>{['GBP','USD','EUR','AUD'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className={lbl}>Original Date</label><input type="date" className={inp} value={originalDate} onChange={e => setOriginalDate(e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Description (what is owed for)</label><input className={inp} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Personal loan, unpaid invoice #001, equipment purchase" /></div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Repayment Terms</div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Repayment Schedule</label><textarea className={inp} rows={2} value={repaymentSchedule} onChange={e => setRepaymentSchedule(e.target.value)} placeholder="e.g. £500 on 1 Jan 2025, £500 on 1 Feb 2025" style={{ resize: 'vertical' }} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Interest Rate (% per annum)</label><input className={inp} value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder="0 (leave blank for no interest)" /></div>
            <div><label className={lbl}>Full Repayment Deadline</label><input type="date" className={inp} value={repaymentDeadline} onChange={e => setRepaymentDeadline(e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Default Terms</label><textarea className={inp} rows={2} value={defaultTerms} onChange={e => setDefaultTerms(e.target.value)} placeholder="What happens if payment is not made by the deadline" style={{ resize: 'vertical' }} /></div>
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Debt Acknowledgment'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Debt Acknowledgment Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Debt Acknowledgment differs from an informal IOU or text message</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Legally structured', body: 'A .uds debt acknowledgment follows a proper legal structure: parties, amount, description, repayment terms, default. Unlike "I owe you £500" in a text.' },
              { title: 'Tamper-evident', body: 'Neither party can alter the agreed amount or terms after sealing. "I don\'t remember agreeing to that interest rate" disputes are resolved by verifying the hash.' },
              { title: 'Cryptographic timestamp', body: 'The acknowledgment date is sealed. Cannot be backdated to before a dispute arose.' },
              { title: 'Enforceable starting point', body: 'A signed, dated, sealed debt acknowledgment is far stronger evidence in a small claims court than WhatsApp messages.' },
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
