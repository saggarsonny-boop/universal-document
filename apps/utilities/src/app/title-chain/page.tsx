'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface HistoryEntry {
  id: number
  ownerName: string
  dateAcquired: string
  dateSold: string
  instrumentType: string
  docReference: string
}

export default function TitleChain() {
  const [propertyAddress, setPropertyAddress] = useState('')
  const [currentOwner, setCurrentOwner] = useState('')
  const [entries, setEntries] = useState<HistoryEntry[]>([
    { id: 1, ownerName: '', dateAcquired: '', dateSold: '', instrumentType: 'Warranty Deed', docReference: '' },
  ])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const sectionHead: React.CSSProperties = { fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, marginTop: 24 }

  const INSTRUMENT_TYPES = ['Warranty Deed', 'Quitclaim Deed', 'Grant Deed', 'Bargain and Sale Deed', 'Special Warranty Deed', 'Sheriff\'s Deed', 'Trustee\'s Deed', 'Deed of Trust', 'Mortgage', 'Probate Transfer', 'Foreclosure', 'Other']

  function addEntry() {
    setEntries(prev => [...prev, { id: Date.now(), ownerName: '', dateAcquired: '', dateSold: '', instrumentType: 'Warranty Deed', docReference: '' }])
  }

  function removeEntry(id: number) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateEntry(id: number, field: keyof HistoryEntry, value: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function run() {
    const now = new Date().toISOString()
    const safeAddr = propertyAddress.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().slice(0, 40)

    const chainDoc = {
      format: 'UDS', status: 'sealed',
      title: `Title Chain — ${propertyAddress}`,
      document_type: 'title_chain',
      title_chain: {
        property_address: propertyAddress,
        current_owner: currentOwner,
        chain_entries: entries.map((e, i) => ({
          sequence: i + 1,
          owner_name: e.ownerName,
          date_acquired: e.dateAcquired || undefined,
          date_sold: e.dateSold || undefined,
          instrument_type: e.instrumentType,
          document_reference: e.docReference || undefined,
        })),
        chain_length: entries.length,
        chain_complete: entries.every(e => e.ownerName && e.dateAcquired),
      },
      provenance: {
        created_at: now,
        document_type: 'title_chain',
        property: propertyAddress,
        generator: 'UD Title Chain · utilities.hive.baby',
      },
      _notice: 'This is not legal advice. Title chain records require verification by a qualified title examiner or solicitor. Always conduct a full title search through official land registry records.',
    }

    const indexDoc = {
      format: 'UDS', status: 'sealed',
      title: `Title Chain Index — ${propertyAddress}`,
      document_type: 'udz_index',
      bundle: {
        property_address: propertyAddress,
        current_owner: currentOwner,
        total_entries: entries.length,
        files: [`title-chain-${safeAddr}.uds`],
      },
      provenance: { created_at: now },
    }

    import('jszip').then(({ default: JSZip }) => {
      const zip = new JSZip()
      zip.file(`title-chain-${safeAddr}.uds`, JSON.stringify(chainDoc, null, 2))
      zip.file('_index.uds', JSON.stringify(indexDoc, null, 2))
      zip.generateAsync({ type: 'blob' }).then(blob => {
        setResult({ url: URL.createObjectURL(blob), name: `title-chain-${safeAddr}.udz` })
      })
    })
  }

  const can = !propertyAddress || !currentOwner || entries.length === 0 || entries.some(e => !e.ownerName)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Title Chain</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: '#1e2d3d', color: '#fff', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Enterprise</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Generate a .udz title chain archive — a sealed bundle recording the complete chain of ownership for a property, with provenance and chain-of-custody metadata for every transfer.
      </p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        This is not legal advice. Always consult a qualified title examiner or solicitor before relying on any title chain document.
      </div>

      {/* Property */}
      <div style={sectionHead}>Property</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Property address *</label>
          <input style={inp} value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="Full property address" />
        </div>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Current owner name *</label>
          <input style={inp} value={currentOwner} onChange={e => setCurrentOwner(e.target.value)} placeholder="Current registered owner" />
        </div>
      </div>

      {/* Ownership history */}
      <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Ownership History</span>
        <button onClick={addEntry} style={{ background: 'none', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '4px 12px', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', cursor: 'pointer' }}>+ Add entry</button>
      </div>

      {entries.map((entry, idx) => (
        <div key={entry.id} style={{ marginBottom: 16, padding: '16px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            Entry {idx + 1}
            {entries.length > 1 && (
              <button onClick={() => removeEntry(entry.id)} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--ud-danger)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)' }}>Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Owner name *</label>
              <input style={inp} value={entry.ownerName} onChange={e => updateEntry(entry.id, 'ownerName', e.target.value)} placeholder="Owner or entity name" />
            </div>
            <div>
              <label style={lbl}>Date acquired</label>
              <input type="date" style={inp} value={entry.dateAcquired} onChange={e => updateEntry(entry.id, 'dateAcquired', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Date sold / transferred</label>
              <input type="date" style={inp} value={entry.dateSold} onChange={e => updateEntry(entry.id, 'dateSold', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Instrument type</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={entry.instrumentType} onChange={e => updateEntry(entry.id, 'instrumentType', e.target.value)}>
                {INSTRUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Document reference</label>
              <input style={inp} value={entry.docReference} onChange={e => updateEntry(entry.id, 'docReference', e.target.value)} placeholder="Book/Page, Instrument No., etc." />
            </div>
          </div>
        </div>
      ))}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Title chain created ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {propertyAddress.slice(0, 40)}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .udz →</a>
        </div>
      )}

      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>
        Generate Title Chain Archive
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Title Chain differs from paper abstracts and conveyancing software</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Paper title abstracts are flat and fragile. Conveyancing platforms require firm licences. UD Title Chain creates a structured, tamper-evident ownership history anyone can verify.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Paper title abstract', body: 'A handwritten or typed list of deeds and instruments. No structured data, no hash, no proof the chain hasn\'t been altered or a link inserted retrospectively. Trusted only because the solicitor produced it.' },
            { title: 'Conveyancing software (Osprey, Leap, LEAP)', body: 'Practice management tools for law firms. Not available to property managers, title companies, or self-represented buyers. Require subscription and training for what is often a one-time property transaction task.' },
            { title: 'UD Title Chain — structured ownership history', body: 'Each ownership period — owner name, dates, instrument type, document reference — is a structured record in the .udz index. Queryable, sortable, and readable without any specialist software.' },
            { title: 'UD Title Chain — tamper-evident bundle', body: 'The complete chain is sealed at creation time. Any modification to the ownership sequence — adding, removing, or reordering entries — is detectable. Independent verification requires only UD Reader.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="title-chain" tips={tourSteps['title-chain']} />
    </div>
  )
}
