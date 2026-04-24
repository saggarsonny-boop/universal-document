'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type LineItem = { id: string; description: string; qty: string; unit: string; total: string }

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function ReceiptPage() {
  const [merchant, setMerchant] = useState('')
  const [merchantAddress, setMerchantAddress] = useState('')
  const [receiptDate, setReceiptDate] = useState('')
  const [receiptNumber, setReceiptNumber] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [customer, setCustomer] = useState('')
  const [items, setItems] = useState<LineItem[]>([{ id: 'i1', description: '', qty: '1', unit: '', total: '' }])
  const [tax, setTax] = useState('')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addItem = () => setItems(p => [...p, { id: `i${Date.now()}`, description: '', qty: '1', unit: '', total: '' }])
  const updateItem = (id: string, f: keyof LineItem, v: string) => setItems(p => p.map(i => i.id === id ? { ...i, [f]: v } : i))
  const removeItem = (id: string) => setItems(p => p.filter(i => i.id !== id))

  const subtotal = items.reduce((s, i) => s + (parseFloat(i.total) || 0), 0)
  const taxAmt = parseFloat(tax) || 0
  const grandTotal = subtotal + taxAmt

  const handleGenerate = async () => {
    if (!merchant.trim()) { setError('Merchant name is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${merchant}|${receiptDate}|${grandTotal}|${receiptNumber}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0',
        format: 'uds',
        id: `receipt-${hash.slice(0, 16)}`,
        created: now,
        schema: 'receipt',
        metadata: {
          merchant,
          merchant_address: merchantAddress || null,
          receipt_date: receiptDate || now.slice(0, 10),
          receipt_number: receiptNumber || `R-${Date.now()}`,
          currency,
          payment_method: paymentMethod || null,
          customer: customer || null,
          subtotal,
          tax: taxAmt,
          grand_total: grandTotal,
          notes: notes || null,
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Receipt' },
        content: [
          { type: 'heading', text: `Receipt — ${merchant}` },
          { type: 'paragraph', text: `Date: ${receiptDate || now.slice(0, 10)}` },
          { type: 'paragraph', text: `Receipt #: ${receiptNumber || 'auto'}` },
          { type: 'paragraph', text: `Customer: ${customer || 'N/A'}` },
          { type: 'heading', level: 2, text: 'Line Items' },
          ...items.filter(i => i.description).map(i => ({
            type: 'paragraph',
            text: `${i.description} — qty ${i.qty} × ${i.unit || ''} = ${currency} ${i.total}`,
          })),
          { type: 'paragraph', text: `Subtotal: ${currency} ${subtotal.toFixed(2)}` },
          { type: 'paragraph', text: `Tax: ${currency} ${taxAmt.toFixed(2)}` },
          { type: 'paragraph', text: `Total: ${currency} ${grandTotal.toFixed(2)}` },
          { type: 'paragraph', text: `Payment: ${paymentMethod || 'N/A'}` },
          { type: 'paragraph', text: `SHA-256: ${hash}` },
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const safeName = merchant.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url, name: `receipt-${safeName}-${now.slice(0, 10)}.uds` })
    } catch {
      setError('Failed to generate receipt.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="receipt" tips={tourSteps['receipt'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Receipt</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Convert any purchase receipt, invoice, or proof of payment into a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> file. Cannot be altered after sealing. Accepted for expense claims, warranty records, insurance claims, and legal disputes.
          </p>
        </div>

        <div data-tour="merchant" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Merchant & Transaction</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Merchant Name *</label><input className={inp} value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="e.g. Tesco plc" /></div>
            <div><label className={lbl}>Receipt Number</label><input className={inp} value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} placeholder="e.g. INV-2024-001" /></div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className={lbl}>Merchant Address</label>
            <input className={inp} value={merchantAddress} onChange={e => setMerchantAddress(e.target.value)} placeholder="Optional" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Date</label><input type="date" className={inp} value={receiptDate} onChange={e => setReceiptDate(e.target.value)} /></div>
            <div><label className={lbl}>Currency</label>
              <select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>
                {['GBP','USD','EUR','CAD','AUD','JPY','CHF','SGD'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Payment Method</label><input className={inp} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} placeholder="e.g. Visa •••• 4242" /></div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Customer / Payee (optional)</label>
          <input className={inp} value={customer} onChange={e => setCustomer(e.target.value)} placeholder="For B2B receipts" />
        </div>

        <div data-tour="line-items" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700 }}>Line Items</div>
            <button onClick={addItem} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Add Item</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
            {['Description', 'Qty', 'Unit Price', `Total (${currency})`, ''].map(h => (
              <div key={h} style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: '#6b7280', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
              <input className={inp} value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} placeholder="Item description" />
              <input className={inp} value={item.qty} onChange={e => updateItem(item.id, 'qty', e.target.value)} placeholder="1" />
              <input className={inp} value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} placeholder="0.00" />
              <input className={inp} value={item.total} onChange={e => updateItem(item.id, 'total', e.target.value)} placeholder="0.00" />
              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18, padding: '0 4px' }}>×</button>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 24, fontSize: 14 }}>
              <div>Subtotal: <strong>{currency} {subtotal.toFixed(2)}</strong></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Tax: <input className={inp} style={{ width: 80, display: 'inline' }} value={tax} onChange={e => setTax(e.target.value)} placeholder="0.00" />
              </div>
              <div>Total: <strong style={{ color: '#c8960a' }}>{currency} {grandTotal.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Notes</label>
          <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Return policy, warranty, etc." style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}

        <button data-tour="seal" onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Receipt'}
        </button>

        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Receipt Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
              Download {result.name}
            </a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Receipt differs from PDF receipts or email confirmations</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Tamper-evident', body: 'A PDF receipt can be edited in seconds. A .uds receipt is SHA-256 hashed — any alteration changes the hash, making modification immediately detectable.' },
              { title: 'Structured data', body: 'Line items, totals, tax, and payment method are stored as queryable structured data — not buried in a PDF. Useful for automated expense processing.' },
              { title: 'Legally defensible', body: 'The blockchain timestamp proves the receipt was issued at a specific moment. Neither party can backdate or alter the transaction record.' },
              { title: 'Open format', body: 'A .uds file is readable JSON. Any person or system can verify it without proprietary software.' },
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
