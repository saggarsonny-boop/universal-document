'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function EventTicketPage() {
  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventVenue, setEventVenue] = useState('')
  const [ticketType, setTicketType] = useState('General Admission')
  const [organiserName, setOrganiserName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [attendeeNames, setAttendeeNames] = useState<string[]>([''])
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('GBP')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateAttendee = (i: number, v: string) => setAttendeeNames(p => p.map((n, idx) => idx === i ? v : n))

  const handleQuantityChange = (q: number) => {
    const safeQ = Math.min(Math.max(1, q), 20)
    setQuantity(safeQ)
    setAttendeeNames(prev => {
      const next = [...prev]
      while (next.length < safeQ) next.push('')
      return next.slice(0, safeQ)
    })
  }

  const handleGenerate = async () => {
    if (!eventName.trim()) { setError('Event name is required.'); return }
    if (!eventDate) { setError('Event date is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const tickets = []

      if (quantity === 1) {
        const attendee = attendeeNames[0] || 'General'
        const content = `${eventName}|${eventDate}|${eventVenue}|${ticketType}|${attendee}|${now}`
        const hash = await sha256hex(new TextEncoder().encode(content))
        const doc = {
          ud_version: '1.0', format: 'uds', id: `ticket-${hash.slice(0, 16)}`, created: now, schema: 'event_ticket',
          expires: eventDate,
          metadata: { event: eventName, event_date: eventDate, venue: eventVenue || null, ticket_type: ticketType, organiser: organiserName || null, attendee: attendee, price: price ? parseFloat(price) : null, currency, notes: notes || null },
          provenance: { ticket_hash: hash, issued_at: now, tool: 'UD Event Ticket' },
          content: [
            { type: 'heading', text: eventName },
            { type: 'paragraph', text: `Date: ${eventDate}` },
            { type: 'paragraph', text: `Venue: ${eventVenue || 'TBD'}` },
            { type: 'paragraph', text: `Ticket Type: ${ticketType}` },
            { type: 'paragraph', text: `Attendee: ${attendee}` },
            { type: 'paragraph', text: `Ticket ID: ${hash.slice(0, 16).toUpperCase()}` },
            ...(price ? [{ type: 'paragraph', text: `Price: ${currency} ${price}` }] : []),
          ],
        }
        tickets.push({ doc, filename: `ticket-${hash.slice(0, 8).toUpperCase()}.uds` })
      } else {
        for (let i = 0; i < quantity; i++) {
          const attendee = attendeeNames[i] || `Guest ${i + 1}`
          const content = `${eventName}|${eventDate}|${ticketType}|${attendee}|${now}|${i}`
          const hash = await sha256hex(new TextEncoder().encode(content))
          const doc = {
            ud_version: '1.0', format: 'uds', id: `ticket-${hash.slice(0, 16)}`, created: now, schema: 'event_ticket',
            expires: eventDate,
            metadata: { event: eventName, event_date: eventDate, venue: eventVenue || null, ticket_type: ticketType, organiser: organiserName || null, attendee, ticket_number: i + 1, total_tickets: quantity },
            provenance: { ticket_hash: hash, issued_at: now, tool: 'UD Event Ticket' },
            content: [{ type: 'heading', text: eventName }, { type: 'paragraph', text: `${ticketType} · Ticket ${i + 1}/${quantity}` }, { type: 'paragraph', text: `Attendee: ${attendee}` }, { type: 'paragraph', text: `ID: ${hash.slice(0, 16).toUpperCase()}` }],
          }
          tickets.push({ doc, filename: `ticket-${i + 1}-${hash.slice(0, 8).toUpperCase()}.uds` })
        }
      }

      let blob: Blob
      let outputName: string
      if (tickets.length === 1) {
        blob = new Blob([JSON.stringify(tickets[0].doc, null, 2)], { type: 'application/json' })
        outputName = tickets[0].filename
      } else {
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        for (const t of tickets) zip.file(t.filename, JSON.stringify(t.doc, null, 2))
        zip.file('bundle.json', JSON.stringify({ event: eventName, event_date: eventDate, total_tickets: quantity, issued_at: now }, null, 2))
        blob = await zip.generateAsync({ type: 'blob' })
        outputName = `tickets-${eventName.slice(0, 20).replace(/\s+/g, '-').toLowerCase()}.udz`
      }

      setResult({ url: URL.createObjectURL(blob), name: outputName })
    } catch {
      setError('Failed to generate tickets.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="event-ticket" tips={tourSteps['event-ticket'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Event Ticket</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 5/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create tamper-evident event tickets as <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> files. Each ticket has a unique SHA-256 hash. Validate at the door using UD Validator — no app required.
          </p>
        </div>

        <div data-tour="event-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Event Details</div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Event Name *</label><input className={inp} value={eventName} onChange={e => setEventName(e.target.value)} placeholder="e.g. Summer Garden Party 2025" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Event Date *</label><input type="date" className={inp} value={eventDate} onChange={e => setEventDate(e.target.value)} /></div>
            <div><label className={lbl}>Venue</label><input className={inp} value={eventVenue} onChange={e => setEventVenue(e.target.value)} placeholder="e.g. The Royal Pavilion, Brighton" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div><label className={lbl}>Ticket Type</label>
              <select className={inp} value={ticketType} onChange={e => setTicketType(e.target.value)}>
                {['General Admission', 'VIP', 'Early Bird', 'Day Pass', 'Weekend Pass', 'Backstage', 'Press', 'Complimentary'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Organiser</label><input className={inp} value={organiserName} onChange={e => setOrganiserName(e.target.value)} placeholder="Optional" /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><label className={lbl}>Price</label><input className={inp} value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" /></div>
              <div><label className={lbl}>Currency</label><select className={inp} value={currency} onChange={e => setCurrency(e.target.value)}>{['GBP','USD','EUR'].map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
          </div>
        </div>

        <div data-tour="batch-size" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Tickets</div>
          <div style={{ marginBottom: 16 }}>
            <label className={lbl}>Quantity (1–20)</label>
            <input type="number" className={inp} style={{ width: 100 }} value={quantity} min={1} max={20} onChange={e => handleQuantityChange(parseInt(e.target.value) || 1)} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {attendeeNames.slice(0, quantity).map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: '#6b7280', minWidth: 24 }}>#{i + 1}</span>
                <input className={inp} value={n} onChange={e => updateAttendee(i, e.target.value)} placeholder={`Attendee ${i + 1} name (optional)`} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <label className={lbl}>Notes</label>
          <textarea className={inp} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Gate time, dress code, etc." style={{ resize: 'vertical' }} />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Generating…' : `Generate ${quantity} Ticket${quantity > 1 ? 's' : ''}`}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Ticket{quantity > 1 ? 's' : ''} Ready</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Verify at the door: upload .uds to utilities.hive.baby/verify</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Event Ticket differs from Eventbrite or PDF tickets</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Each ticket is cryptographically unique', body: 'Every ticket has a different SHA-256 hash. Duplicating a ticket is detectable instantly during validation.' },
              { title: 'No platform fees', body: 'No Eventbrite, no Ticketmaster, no platform fees. Keep the full ticket price.' },
              { title: 'Validate in any browser', body: 'UD Validator works in any browser — no app, no QR scanner hardware, no platform account.' },
              { title: 'Auto-expires on event date', body: 'The .uds expires on the event date. Tickets for past events are clearly expired.' },
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
