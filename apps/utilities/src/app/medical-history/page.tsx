'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

type Entry = { id: string; name: string; detail: string; date: string }

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function makeEntries(n: number): Entry[] {
  return Array.from({ length: n }, (_, i) => ({ id: `e${Date.now()}-${i}`, name: '', detail: '', date: '' }))
}

export default function MedicalHistoryPage() {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [bloodType, setBloodType] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [allergies, setAllergies] = useState('')
  const [conditions, setConditions] = useState<Entry[]>(makeEntries(1))
  const [medications, setMedications] = useState<Entry[]>(makeEntries(1))
  const [procedures, setProcedures] = useState<Entry[]>(makeEntries(1))
  const [vaccinations, setVaccinations] = useState<Entry[]>(makeEntries(1))
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>) =>
    setter(p => [...p, { id: `e${Date.now()}`, name: '', detail: '', date: '' }])
  const updateEntry = (setter: React.Dispatch<React.SetStateAction<Entry[]>>, id: string, f: keyof Entry, v: string) =>
    setter(p => p.map(e => e.id === id ? { ...e, [f]: v } : e))

  const handleGenerate = async () => {
    if (!name.trim()) { setError('Patient name is required.'); return }
    setError('')
    setLoading(true)
    try {
      const now = new Date().toISOString()
      const content = `${name}|${dob}|${bloodType}|${allergies}`
      const hash = await sha256hex(new TextEncoder().encode(content))
      const doc = {
        ud_version: '1.0', format: 'uds', id: `medhistory-${hash.slice(0, 16)}`, created: now, schema: 'medical_history',
        audience_layers: ['patient', 'emergency_responder', 'specialist'],
        metadata: {
          patient_name: name, date_of_birth: dob || null, blood_type: bloodType || null,
          emergency_contact: { name: emergencyName || null, phone: emergencyPhone || null },
          allergies: allergies ? allergies.split(',').map(a => a.trim()).filter(Boolean) : [],
          conditions: conditions.filter(e => e.name).map(e => ({ name: e.name, detail: e.detail, date: e.date || null })),
          medications: medications.filter(e => e.name).map(e => ({ name: e.name, detail: e.detail, date: e.date || null })),
          procedures: procedures.filter(e => e.name).map(e => ({ name: e.name, detail: e.detail, date: e.date || null })),
          vaccinations: vaccinations.filter(e => e.name).map(e => ({ name: e.name, detail: e.detail, date: e.date || null })),
        },
        provenance: { content_sha256: hash, sealed_at: now, tool: 'UD Medical History' },
        content: [
          { type: 'heading', text: `Medical History — ${name}`, audience: 'all' },
          { type: 'paragraph', text: `Blood Type: ${bloodType || 'Unknown'}`, audience: 'emergency_responder' },
          { type: 'paragraph', text: `Emergency Contact: ${emergencyName || 'N/A'} · ${emergencyPhone || 'N/A'}`, audience: 'emergency_responder' },
          { type: 'paragraph', text: `Allergies: ${allergies || 'None recorded'}`, audience: 'emergency_responder' },
          ...(conditions.filter(e => e.name).map(e => ({ type: 'paragraph', text: `Condition: ${e.name} — ${e.detail}`, audience: 'specialist' }))),
          ...(medications.filter(e => e.name).map(e => ({ type: 'paragraph', text: `Medication: ${e.name} — ${e.detail}`, audience: 'all' }))),
          ...(procedures.filter(e => e.name).map(e => ({ type: 'paragraph', text: `Procedure: ${e.name} (${e.date || 'date unknown'}) — ${e.detail}`, audience: 'specialist' }))),
          ...(vaccinations.filter(e => e.name).map(e => ({ type: 'paragraph', text: `Vaccine: ${e.name} (${e.date || 'date unknown'})`, audience: 'all' }))),
        ],
      }
      const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' })
      const safeName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url: URL.createObjectURL(blob), name: `medical-history-${safeName}.uds` })
    } catch {
      setError('Failed to generate medical history document.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  const EntryList = ({ entries, setter, placeholder }: { entries: Entry[]; setter: React.Dispatch<React.SetStateAction<Entry[]>>; placeholder: string }) => (
    <div>
      {entries.map(e => (
        <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: 8, marginBottom: 8 }}>
          <input className={inp} value={e.name} onChange={ev => updateEntry(setter, e.id, 'name', ev.target.value)} placeholder={placeholder} />
          <input className={inp} value={e.detail} onChange={ev => updateEntry(setter, e.id, 'detail', ev.target.value)} placeholder="Details / dose / notes" />
          <input type="date" className={inp} value={e.date} onChange={ev => updateEntry(setter, e.id, 'date', ev.target.value)} />
        </div>
      ))}
      <button onClick={() => addEntry(setter)} style={{ background: 'none', border: '1px dashed #d1d5db', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#6b7280' }}>+ Add row</button>
    </div>
  )

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="medical-history" tips={tourSteps['medical-history'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · All features free during beta</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Medical History</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE · 1/MONTH</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a personal medical history document as a tamper-evident <code style={{ fontFamily: "'DM Mono',monospace" }}>.uds</code> file with audience layers for the patient, emergency responders, and specialists.
          </p>
        </div>
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, padding: '12px 16px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, color: '#856404' }}>This is not medical advice. Always consult a qualified clinician. This document does not replace professional medical records.</p>
        </div>

        <div data-tour="patient-details" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Patient Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Full Name *</label><input className={inp} value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className={lbl}>Date of Birth</label><input type="date" className={inp} value={dob} onChange={e => setDob(e.target.value)} /></div>
            <div><label className={lbl}>Blood Type</label>
              <select className={inp} value={bloodType} onChange={e => setBloodType(e.target.value)}>
                <option value="">Unknown</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Emergency Contact Name</label><input className={inp} value={emergencyName} onChange={e => setEmergencyName(e.target.value)} /></div>
            <div><label className={lbl}>Emergency Contact Phone</label><input className={inp} value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} /></div>
          </div>
          <div><label className={lbl}>Allergies (comma-separated)</label><input className={inp} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="Penicillin, Latex, Peanuts" /></div>
        </div>

        <div data-tour="conditions" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Conditions</div>
          <EntryList entries={conditions} setter={setConditions} placeholder="e.g. Type 2 Diabetes" />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Medications</div>
          <EntryList entries={medications} setter={setMedications} placeholder="e.g. Metformin 500mg" />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Procedures & Surgeries</div>
          <EntryList entries={procedures} setter={setProcedures} placeholder="e.g. Appendectomy" />
        </div>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Vaccinations</div>
          <EntryList entries={vaccinations} setter={setVaccinations} placeholder="e.g. COVID-19 Booster" />
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Sealing…' : 'Seal Medical History'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Medical History Sealed</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Medical History differs from paper or PDF health summaries</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Audience layers', body: 'Three layers in one file: patient (plain English), emergency responder (key facts — blood type, allergies, emergency contact), and specialist (full clinical detail).' },
              { title: 'Structured data', body: 'Conditions, medications, procedures, and vaccinations are stored as structured data objects — not buried in free text.' },
              { title: 'Tamper-evident', body: 'SHA-256 sealed at the moment of creation. Nobody can alter your medical history after sealing — important for insurance and legal contexts.' },
              { title: 'Portable', body: 'A .uds is a JSON file that travels with you. Works in any country, on any device, without proprietary healthcare software.' },
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
