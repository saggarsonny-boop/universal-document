'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function RentalAgreementPage() {
  const [propertyAddress, setPropertyAddress] = useState('')
  const [propertyType, setPropertyType] = useState('Apartment')
  const [hostName, setHostName] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [nightlyRate, setNightlyRate] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [securityDeposit, setSecurityDeposit] = useState('')
  const [maxGuests, setMaxGuests] = useState('2')
  const [houseRules, setHouseRules] = useState('')
  const [checkInTime, setCheckInTime] = useState('15:00')
  const [checkOutTime, setCheckOutTime] = useState('11:00')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nights = checkIn && checkOut ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0
  const totalRent = nights * (parseFloat(nightlyRate) || 0)

  const handleGenerate = async () => {
    if (!propertyAddress.trim()) { setError('Property address is required.'); return }
    if (!hostName.trim() || !guestName.trim()) { setError('Host and guest names are required.'); return }
    if (!checkIn || !checkOut) { setError('Check-in and check-out dates are required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${propertyAddress}|${hostName}|${guestName}|${checkIn}|${checkOut}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `rental-${hash.slice(0, 16)}`, created: now, schema: 'rental_agreement',
        expires: checkOut,
        audience_layers: ['host', 'guest'],
        metadata: {
          property: { address: propertyAddress, type: propertyType },
          host: { name: hostName, email: hostEmail || null },
          guest: { name: guestName, email: guestEmail || null },
          stay: { check_in: checkIn, check_out: checkOut, check_in_time: checkInTime, check_out_time: checkOutTime, nights, max_guests: parseInt(maxGuests) },
          financials: { nightly_rate: parseFloat(nightlyRate) || 0, currency, total_rent: totalRent, security_deposit: parseFloat(securityDeposit) || 0 },
          house_rules: houseRules ? houseRules.split('\n').map(r => r.trim()).filter(Boolean) : [],
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Rental Agreement' },
        content: [
          { type: 'heading', text: 'Short-Term Rental Agreement' },
          { type: 'paragraph', text: `Property: ${propertyAddress} (${propertyType})`, audience: 'all' },
          { type: 'paragraph', text: `Host: ${hostName}`, audience: 'host' },
          { type: 'paragraph', text: `Guest: ${guestName}`, audience: 'guest' },
          { type: 'paragraph', text: `Check-in: ${checkIn} from ${checkInTime}`, audience: 'all' },
          { type: 'paragraph', text: `Check-out: ${checkOut} by ${checkOutTime}`, audience: 'all' },
          { type: 'paragraph', text: `Duration: ${nights} night${nights !== 1 ? 's' : ''}`, audience: 'all' },
          { type: 'paragraph', text: `Rate: ${currency} ${nightlyRate}/night × ${nights} = ${currency} ${totalRent.toFixed(2)}`, audience: 'all' },
          { type: 'paragraph', text: `Security deposit: ${currency} ${securityDeposit || '0'}`, audience: 'all' },
          { type: 'paragraph', text: `Max guests: ${maxGuests}`, audience: 'guest' },
          ...(houseRules ? [{ type: 'heading', level: 2, text: 'House Rules', audience: 'all' }, ...houseRules.split('\n').filter(r => r.trim()).map(r => ({ type: 'paragraph', text: r.trim(), audience: 'guest' }))] : []),
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      setResult({ url: URL.createObjectURL(blob), name: `rental-${guestName.replace(/\s+/g, '-').toLowerCase()}-${checkIn}.uds` })
    } catch {
      setError('Failed to generate rental agreement.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="rental-agreement" tips={tourSteps['rental-agreement'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Rental Agreement</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 1/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Short-term rental agreements for holiday lets and room rentals as tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> files. Simpler than UD Smart Lease. Expiry on checkout date.
          </p>
        </div>
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#856404' }}>This is not legal advice. For properties subject to Housing Acts or landlord licensing, consult a solicitor.</p>
        </div>

        <div data-tour="property-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Property</div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Address *</label><input className={inp} value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="Full property address" /></div>
          <div>
            <label className={lbl}>Property Type</label>
            <select className={inp} value={propertyType} onChange={e => setPropertyType(e.target.value)}>
              {['Apartment', 'House', 'Room', 'Cottage', 'Villa', 'Studio', 'Other'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Parties</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Host Name *</label><input className={inp} value={hostName} onChange={e => setHostName(e.target.value)} /></div>
            <div><label className={lbl}>Host Email</label><input type="email" className={inp} value={hostEmail} onChange={e => setHostEmail(e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Guest Name *</label><input className={inp} value={guestName} onChange={e => setGuestName(e.target.value)} /></div>
            <div><label className={lbl}>Guest Email</label><input type="email" className={inp} value={guestEmail} onChange={e => setGuestEmail(e.target.value)} /></div>
          </div>
        </div>

        <div data-tour="stay-terms" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Stay & Terms</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Check-in *</label><input type="date" className={inp} value={checkIn} onChange={e => setCheckIn(e.target.value)} /></div>
            <div><label className={lbl}>Check-out *</label><input type="date" className={inp} value={checkOut} onChange={e => setCheckOut(e.target.value)} /></div>
            <div><label className={lbl}>Check-in time</label><input type="time" className={inp} value={checkInTime} onChange={e => setCheckInTime(e.target.value)} /></div>
            <div><label className={lbl}>Check-out time</label><input type="time" className={inp} value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} /></div>
          </div>
          {nights > 0 && <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Duration: {nights} night{nights !== 1 ? 's' : ''}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Nightly Rate</label><input className={inp} value={nightlyRate} onChange={e => setNightlyRate(e.target.value)} placeholder="0.00" /></div>
            <div><label className={lbl}>Currency</label><select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>{['GBP','USD','EUR','AUD'].map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className={lbl}>Security Deposit</label><input className={inp} value={securityDeposit} onChange={e => setSecurityDeposit(e.target.value)} placeholder="0.00" /></div>
            <div><label className={lbl}>Max Guests</label><input className={inp} value={maxGuests} onChange={e => setMaxGuests(e.target.value)} /></div>
          </div>
          {nights > 0 && parseFloat(nightlyRate) > 0 && (
            <div style={{ marginTop: 12, padding: '10px 16px', background: '#fafaf8', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
              Total: {currency} {totalRent.toFixed(2)} ({nights} nights × {currency} {nightlyRate})
            </div>
          )}
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>House Rules (one per line)</label>
          <textarea className={inp} rows={4} value={houseRules} onChange={e => setHouseRules(e.target.value)} placeholder={"No smoking\nNo pets\nNo parties\nQuiet hours 22:00–08:00"} style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Rental Agreement'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Agreement Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Rental Agreement differs from Airbnb terms or Word templates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Tamper-evident terms', body: 'Once sealed, neither host nor guest can alter the agreed terms. Disputes about what was agreed are resolved by the SHA-256 sealed .uds.' },
              { title: 'Audience layers', body: 'Host view and guest view in one document. Each party sees the clauses that apply to them without confusion.' },
              { title: 'Auto-expires on checkout', body: 'The document expires on the checkout date. No long-term legal obligations are created accidentally.' },
              { title: 'No Airbnb dependency', body: 'Direct rentals between individuals without platform fees or platform-controlled terms and conditions.' },
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
