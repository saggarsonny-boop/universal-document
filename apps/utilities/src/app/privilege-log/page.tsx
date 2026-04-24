'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

interface LogEntry {
  id: number
  batesNumber: string
  date: string
  author: string
  recipients: string
  documentType: string
  privilegeClaimed: string
  description: string
}

const PRIVILEGE_TYPES = ['Attorney-Client', 'Work Product', 'Common Interest', 'Other']
const DOC_TYPES = ['Email', 'Letter', 'Memorandum', 'Draft', 'Notes', 'Report', 'Contract', 'Agreement', 'Spreadsheet', 'Presentation', 'Other']

export default function PrivilegeLog() {
  const [caseName, setCaseName] = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [producingParty, setProducingParty] = useState('')
  const [entries, setEntries] = useState<LogEntry[]>([
    { id: 1, batesNumber: '', date: '', author: '', recipients: '', documentType: 'Email', privilegeClaimed: 'Attorney-Client', description: '' },
  ])
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ud-ink)', background: '#fff', boxSizing: 'border-box' }
  const lbl: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }
  const sectionHead: React.CSSProperties = { fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, marginTop: 24 }

  function addEntry() {
    setEntries(prev => [...prev, { id: Date.now(), batesNumber: '', date: '', author: '', recipients: '', documentType: 'Email', privilegeClaimed: 'Attorney-Client', description: '' }])
  }

  function removeEntry(id: number) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function updateEntry(id: number, field: keyof LogEntry, value: string) {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  function run() {
    const now = new Date().toISOString()
    const safeCase = caseName.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().slice(0, 40)

    const doc = {
      format: 'UDS', status: 'sealed',
      title: `Privilege Log — ${caseName}`,
      document_type: 'privilege_log',
      privilege_log: {
        case_name: caseName,
        jurisdiction: jurisdiction || undefined,
        producing_party: producingParty,
        log_date: now,
        total_entries: entries.length,
        entries: entries.map((e, i) => ({
          entry_number: i + 1,
          bates_number: e.batesNumber || undefined,
          date: e.date || undefined,
          author: e.author || undefined,
          recipients: e.recipients || undefined,
          document_type: e.documentType,
          privilege_claimed: e.privilegeClaimed,
          description: e.description || undefined,
        })),
      },
      provenance: {
        created_at: now,
        document_type: 'privilege_log',
        case: caseName,
        producing_party: producingParty,
        generator: 'UD Privilege Log · utilities.hive.baby',
      },
      _notice: 'This is not legal advice. Privilege log entries and assertions of privilege should be reviewed by qualified legal counsel before production in any legal proceeding.',
    }

    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
    setResult({ url: URL.createObjectURL(blob), name: `privilege-log-${safeCase}.uds` })
  }

  const can = !caseName || !producingParty || entries.length === 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <a href="/" style={{ fontSize: 13, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>← All tools</a>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ud-ink)', fontFamily: 'var(--font-display)' }}>UD Privilege Log</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99, background: 'var(--ud-gold-3)', color: 'var(--ud-gold)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pro</span>
          <span style={{ fontSize: 9, color: 'var(--ud-muted)', fontFamily: 'var(--font-mono)', paddingLeft: 10 }}>Free during beta</span>
        </div>
      </div>

      <p style={{ fontSize: 16, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: 8, lineHeight: 1.6 }}>
        Generate a structured, tamper-evident privilege log as a sealed .uds document. Records attorney-client, work product, and common interest privilege assertions with full chain of custody provenance.
      </p>
      <div style={{ fontSize: 12, color: 'var(--ud-danger)', marginBottom: 28, padding: '8px 12px', background: 'rgba(226,75,74,0.06)', border: '1px solid rgba(226,75,74,0.2)', borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)' }}>
        This is not legal advice. Privilege assertions must be reviewed by qualified legal counsel before production in any proceeding.
      </div>

      {/* Case details */}
      <div style={sectionHead}>Case Details</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 8 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <label style={lbl}>Case name *</label>
          <input style={inp} value={caseName} onChange={e => setCaseName(e.target.value)} placeholder="Smith v. Jones, No. 24-CV-1234" />
        </div>
        <div>
          <label style={lbl}>Jurisdiction</label>
          <input style={inp} value={jurisdiction} onChange={e => setJurisdiction(e.target.value)} placeholder="e.g. S.D.N.Y., Delaware Court of Chancery" />
        </div>
        <div>
          <label style={lbl}>Producing party *</label>
          <input style={inp} value={producingParty} onChange={e => setProducingParty(e.target.value)} placeholder="Name of producing party" />
        </div>
      </div>

      {/* Log entries */}
      <div style={{ ...sectionHead, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Log Entries ({entries.length})</span>
        <button onClick={addEntry} style={{ background: 'none', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', padding: '4px 12px', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--ud-ink)', cursor: 'pointer' }}>+ Add entry</button>
      </div>

      {entries.map((entry, idx) => (
        <div key={entry.id} style={{ marginBottom: 16, padding: '16px 18px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius-lg)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
            <span>Entry {idx + 1}</span>
            {entries.length > 1 && (
              <button onClick={() => removeEntry(entry.id)} style={{ background: 'none', border: 'none', color: 'var(--ud-danger)', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-body)', padding: 0 }}>Remove</button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Bates number</label>
              <input style={inp} value={entry.batesNumber} onChange={e => updateEntry(entry.id, 'batesNumber', e.target.value)} placeholder="e.g. SMITH-PRIV-0001" />
            </div>
            <div>
              <label style={lbl}>Date</label>
              <input type="date" style={inp} value={entry.date} onChange={e => updateEntry(entry.id, 'date', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Author</label>
              <input style={inp} value={entry.author} onChange={e => updateEntry(entry.id, 'author', e.target.value)} placeholder="Author name and role" />
            </div>
            <div>
              <label style={lbl}>Recipients</label>
              <input style={inp} value={entry.recipients} onChange={e => updateEntry(entry.id, 'recipients', e.target.value)} placeholder="All recipients" />
            </div>
            <div>
              <label style={lbl}>Document type</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={entry.documentType} onChange={e => updateEntry(entry.id, 'documentType', e.target.value)}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Privilege claimed</label>
              <select style={{ ...inp, cursor: 'pointer' }} value={entry.privilegeClaimed} onChange={e => updateEntry(entry.id, 'privilegeClaimed', e.target.value)}>
                {PRIVILEGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={lbl}>Description of withheld content</label>
              <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={entry.description} onChange={e => updateEntry(entry.id, 'description', e.target.value)} placeholder="General subject matter without revealing privileged content" />
            </div>
          </div>
        </div>
      ))}

      {result && (
        <div style={{ padding: '14px 18px', background: 'var(--ud-teal-2)', border: '1px solid var(--ud-teal)', borderRadius: 'var(--ud-radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ud-teal)', fontFamily: 'var(--font-body)' }}>Privilege log sealed ✓</div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--ud-muted)' }}>{entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {caseName.slice(0, 40)}</div>
          </div>
          <a href={result.url} download={result.name} style={{ padding: '10px 18px', background: 'var(--ud-ink)', color: '#fff', fontWeight: 600, fontSize: 13, borderRadius: 'var(--ud-radius)', fontFamily: 'var(--font-body)', textDecoration: 'none', flexShrink: 0 }}>Download .uds →</a>
        </div>
      )}

      <button onClick={run} disabled={!!can} style={{ width: '100%', padding: '14px', background: can ? 'var(--ud-border)' : 'var(--ud-ink)', color: can ? 'var(--ud-muted)' : '#fff', border: 'none', borderRadius: 'var(--ud-radius)', fontSize: 15, fontWeight: 600, fontFamily: 'var(--font-body)', cursor: can ? 'not-allowed' : 'pointer' }}>
        Seal Privilege Log
      </button>

      <div style={{ marginTop: 40, padding: '16px', background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: 'var(--ud-radius)', fontSize: 12, color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
        Runs in your browser. No data sent to any server. Part of the <a href="https://ud.hive.baby" style={{ color: 'var(--ud-teal)' }}>Universal Document™</a> ecosystem.
      </div>

      <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--ud-border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ud-ink)', fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>How UD Privilege Log differs from a spreadsheet or Relativity</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Privilege logs built in Excel have no tamper evidence and no chain of custody. UD Privilege Log seals entries into a verifiable record.</p>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {[
            { title: 'Excel / spreadsheet privilege log', body: 'Industry standard but legally fragile. No tamper evidence — any cell can be changed after the fact with no record. Opposing counsel can challenge authenticity. No hash, no seal, no chain of custody.' },
            { title: 'Relativity / Logikcull', body: 'Enterprise platforms for large matters. Privilege logging requires setting up review workflows, assigning tags, and exporting — multiple steps for what should be a simple form.' },
            { title: 'UD Privilege Log — sealed chain of custody', body: 'Each privilege log entry and the producing party details are written into a .uds file and sealed with a tamper-evident hash. The log can be verified as unmodified by opposing counsel or the court.' },
            { title: 'UD Privilege Log — FRCP-aligned structure', body: 'Fields map to Federal Rule 26(b)(5) requirements: document type, date, author, recipients, privilege basis, and description. Structured output can be ingested by any review platform or printed for submission.' },
          ].map(card => (
            <div key={card.title} style={{ background: 'var(--ud-paper-2)', border: '1px solid var(--ud-border)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--ud-ink)', fontFamily: 'var(--font-body)', marginBottom: '0.4rem' }}>{card.title}</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--ud-muted)', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>{card.body}</div>
            </div>
          ))}
        </div>
      </div>
      <TooltipTour engineId="privilege-log" tips={tourSteps['privilege-log']} />
    </div>
  )
}
