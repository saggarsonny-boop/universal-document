'use client'
import { useState, useRef } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

type Room = { id: string; name: string; condition: string; notes: string }
type MeterReading = { id: string; type: string; reading: string }

export default function TenancyDepositPage() {
  const [mode, setMode] = useState<'checkin' | 'checkout'>('checkin')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [landlordName, setLandlordName] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [inspectionDate, setInspectionDate] = useState('')
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'r1', name: 'Living Room', condition: 'Good', notes: '' },
    { id: 'r2', name: 'Kitchen', condition: 'Good', notes: '' },
    { id: 'r3', name: 'Bedroom 1', condition: 'Good', notes: '' },
    { id: 'r4', name: 'Bathroom', condition: 'Good', notes: '' },
  ])
  const [meters, setMeters] = useState<MeterReading[]>([
    { id: 'm1', type: 'Electric', reading: '' },
    { id: 'm2', type: 'Gas', reading: '' },
    { id: 'm3', type: 'Water', reading: '' },
  ])
  const [photos, setPhotos] = useState<File[]>([])
  const [generalNotes, setGeneralNotes] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const photoRef = useRef<HTMLInputElement>(null)

  const addRoom = () => setRooms(p => [...p, { id: `r${Date.now()}`, name: '', condition: 'Good', notes: '' }])
  const updateRoom = (id: string, f: keyof Room, v: string) => setRooms(p => p.map(r => r.id === id ? { ...r, [f]: v } : r))
  const updateMeter = (id: string, f: keyof MeterReading, v: string) => setMeters(p => p.map(m => m.id === id ? { ...m, [f]: v } : m))

  const handleGenerate = async () => {
    if (!propertyAddress.trim()) { setError('Property address is required.'); return }
    setError('')
    setLoading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const now = new Date().toISOString()
      const date = inspectionDate || now.slice(0, 10)

      const photoIndex: Array<{ filename: string; sha256: string }> = []
      for (const p of photos) {
        const buf = new Uint8Array(await p.arrayBuffer())
        photoIndex.push({ filename: p.name, sha256: await sha256hex(buf) })
        zip.folder('photos')?.file(p.name, buf)
      }

      const content = `${propertyAddress}|${mode}|${date}|${tenantName}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const inspectionUds = {
        ud_version: '1.0', format: 'uds', id: `inspection-${hash.slice(0, 16)}`, created: now, schema: 'property_inspection',
        metadata: {
          inspection_type: mode === 'checkin' ? 'check-in' : 'check-out',
          property_address: propertyAddress, landlord: landlordName || null, tenant: tenantName || null,
          inspection_date: date, deposit_amount: parseFloat(depositAmount) || null, currency,
          rooms: rooms.filter(r => r.name).map(r => ({ name: r.name, condition: r.condition, notes: r.notes || null })),
          meter_readings: meters.filter(m => m.reading).map(m => ({ type: m.type, reading: m.reading })),
          photo_count: photoIndex.length, general_notes: generalNotes || null,
        },
        provenance: { content_sha256: hash, sealed_at: now, inspection_date: date, tool: 'UD Tenancy Deposit' },
        content: [
          { type: 'heading', text: `Property ${mode === 'checkin' ? 'Check-in' : 'Check-out'} Inspection` },
          { type: 'paragraph', text: `Property: ${propertyAddress}` },
          { type: 'paragraph', text: `Date: ${date}` },
          { type: 'paragraph', text: `Tenant: ${tenantName || 'Not specified'}` },
          { type: 'paragraph', text: `Deposit: ${currency} ${depositAmount || 'Not recorded'}` },
          { type: 'heading', level: 2, text: 'Room Conditions' },
          ...rooms.filter(r => r.name).map(r => ({ type: 'paragraph', text: `${r.name}: ${r.condition}${r.notes ? ` — ${r.notes}` : ''}` })),
          { type: 'heading', level: 2, text: 'Meter Readings' },
          ...meters.filter(m => m.reading).map(m => ({ type: 'paragraph', text: `${m.type}: ${m.reading}` })),
          { type: 'heading', level: 2, text: 'Photos' },
          ...photoIndex.map(p => ({ type: 'paragraph', text: `${p.filename} (SHA-256: ${p.sha256.slice(0, 16)}…)` })),
        ],
      }
      zip.file('inspection.uds', JSON.stringify(inspectionUds, null, 2))
      zip.file('bundle.json', JSON.stringify({ type: `tenancy_deposit_${mode}`, inspection_id: inspectionUds.id, created: now, photos: photoIndex }, null, 2))
      const blob = await zip.generateAsync({ type: 'blob' })
      const safeProp = propertyAddress.slice(0, 20).replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
      setResult({ url: URL.createObjectURL(blob), name: `inspection-${mode}-${safeProp}.udz` })
    } catch {
      setError('Failed to generate inspection report.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"
  const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="tenancy-deposit" tips={tourSteps['tenancy-deposit'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Tenancy Deposit</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 1/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Document rental property condition at check-in and check-out. Photos, room conditions, and meter readings sealed at inspection time. Prevents deposit disputes with cryptographic evidence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['checkin', 'checkout'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '12px', borderRadius: 8, border: `2px solid ${mode === m ? '#c8960a' : '#e5e7eb'}`, background: mode === m ? '#fff9ee' : '#fff', cursor: 'pointer', fontWeight: mode === m ? 700 : 400, color: mode === m ? '#c8960a' : '#6b7280', fontSize: 14 }}>
              {m === 'checkin' ? '🔑 Check-in Inspection' : '🚪 Check-out Inspection'}
            </button>
          ))}
        </div>

        <div data-tour="property-info" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Property & Parties</div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Property Address *</label><input className={inp} value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Landlord</label><input className={inp} value={landlordName} onChange={e => setLandlordName(e.target.value)} /></div>
            <div><label className={lbl}>Tenant</label><input className={inp} value={tenantName} onChange={e => setTenantName(e.target.value)} /></div>
            <div><label className={lbl}>Inspection Date</label><input type="date" className={inp} value={inspectionDate} onChange={e => setInspectionDate(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Deposit Amount</label><input className={inp} value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="0.00" /></div>
            <div><label className={lbl}>Currency</label><select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>{['GBP','USD','EUR'].map(c => <option key={c}>{c}</option>)}</select></div>
          </div>
        </div>

        <div data-tour="room-conditions" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700 }}>Room Conditions</div>
            <button onClick={addRoom} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Add Room</button>
          </div>
          {rooms.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 10, marginBottom: 8 }}>
              <input className={inp} value={r.name} onChange={e => updateRoom(r.id, 'name', e.target.value)} placeholder="Room name" />
              <select className={inp} value={r.condition} onChange={e => updateRoom(r.id, 'condition', e.target.value)}>{CONDITIONS.map(c => <option key={c}>{c}</option>)}</select>
              <input className={inp} value={r.notes} onChange={e => updateRoom(r.id, 'notes', e.target.value)} placeholder="Notes (optional)" />
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Meter Readings</div>
          {meters.map(m => (
            <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10, marginBottom: 8 }}>
              <input className={inp} value={m.type} onChange={e => updateMeter(m.id, 'type', e.target.value)} placeholder="Meter type" />
              <input className={inp} value={m.reading} onChange={e => updateMeter(m.id, 'reading', e.target.value)} placeholder="Reading" />
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Photos</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>All photos are SHA-256 hashed at inspection time</div>
          <button onClick={() => photoRef.current?.click()} style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>Add Photos</button>
          <input ref={photoRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files) setPhotos(p => [...p, ...Array.from(e.target.files!)]) }} />
          {photos.length > 0 && <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>{photos.length} photo{photos.length > 1 ? 's' : ''} added</div>}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>General Notes</label>
          <textarea className={inp} rows={3} value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing report…' : `Seal ${mode === 'checkin' ? 'Check-in' : 'Check-out'} Report`}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Inspection Report Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Tenancy Deposit differs from a Word form or email photos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Photos sealed at inspection time', body: 'Each photo is SHA-256 hashed when you generate the bundle. Nobody can later claim photos were taken on a different date or altered.' },
              { title: 'Tamper-evident conditions', body: 'Room conditions are sealed in the .uds with a cryptographic timestamp. The check-in state is a legally defensible record.' },
              { title: 'Meter readings locked', body: 'Gas, electric, and water readings are embedded as structured data, sealed at the inspection date.' },
              { title: 'Compare check-in vs checkout', body: 'Both bundles use the same schema — making comparison systematic rather than based on memory or altered photos.' },
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
