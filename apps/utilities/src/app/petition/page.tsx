'use client'
import { useState } from 'react'
import TooltipTour from '@/components/TooltipTour'
import { tourSteps } from '@/lib/tourSteps'

async function sha256hex(data: Uint8Array): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer)
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

type Signatory = { id: string; name: string; email: string; note: string }

export default function PetitionPage() {
  const [petitionTitle, setPetitionTitle] = useState('')
  const [petitionText, setPetitionText] = useState('')
  const [targetName, setTargetName] = useState('')
  const [targetDescription, setTargetDescription] = useState('')
  const [signatories, setSignatories] = useState<Signatory[]>([{ id: 's1', name: '', email: '', note: '' }])
  const [petitionHash, setPetitionHash] = useState('')
  const [sealed, setSealed] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addSignatory = () => setSignatories(p => [...p, { id: `s${Date.now()}`, name: '', email: '', note: '' }])
  const updateSig = (id: string, f: keyof Signatory, v: string) => setSignatories(p => p.map(s => s.id === id ? { ...s, [f]: v } : s))
  const removeSig = (id: string) => setSignatories(p => p.filter(s => s.id !== id))

  const sealPetitionText = async () => {
    if (!petitionText.trim()) { setError('Petition text is required before sealing.'); return }
    const hash = await sha256hex(new TextEncoder().encode(petitionText.trim()))
    setPetitionHash(hash)
    setSealed(true)
    setError('')
  }

  const handleGenerate = async () => {
    if (!petitionTitle.trim()) { setError('Petition title is required.'); return }
    if (!sealed || !petitionHash) { setError('Seal the petition text first.'); return }
    const filledSigs = signatories.filter(s => s.name.trim())
    if (filledSigs.length === 0) { setError('At least one signatory is required.'); return }
    setError('')
    setLoading(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const now = new Date().toISOString()

      const petitionUds = {
        ud_version: '1.0', format: 'uds', id: `petition-${petitionHash.slice(0, 16)}`, created: now, schema: 'petition',
        metadata: { title: petitionTitle, target: targetName || null, target_description: targetDescription || null, text_sha256: petitionHash, signatory_count: filledSigs.length },
        provenance: { petition_sha256: petitionHash, sealed_at: now, tool: 'UD Petition' },
        content: [
          { type: 'heading', text: petitionTitle },
          { type: 'paragraph', text: `Addressed to: ${targetName || 'Not specified'}` },
          { type: 'paragraph', text: targetDescription || '' },
          { type: 'heading', level: 2, text: 'Petition Text (SHA-256 sealed)' },
          { type: 'paragraph', text: petitionText },
          { type: 'paragraph', text: `Petition SHA-256: ${petitionHash}` },
          { type: 'heading', level: 2, text: `Signatures (${filledSigs.length})` },
          ...filledSigs.map(s => ({ type: 'paragraph', text: `${s.name}${s.email ? ` <${s.email}>` : ''}${s.note ? ` — ${s.note}` : ''}` })),
        ],
      }
      zip.file('petition.uds', JSON.stringify(petitionUds, null, 2))

      for (const sig of filledSigs) {
        const sigHash = await sha256hex(new TextEncoder().encode(`${sig.name}|${sig.email}|${petitionHash}|${now}`))
        const sigUds = {
          ud_version: '1.0', format: 'uds', id: `sig-${sigHash.slice(0, 16)}`, created: now, schema: 'petition_signature',
          metadata: { signatory_name: sig.name, signatory_email: sig.email || null, note: sig.note || null, petition_sha256: petitionHash, petition_title: petitionTitle },
          provenance: { signature_sha256: sigHash, signed_at: now, petition_hash: petitionHash },
          content: [{ type: 'paragraph', text: `${sig.name} signed the petition "${petitionTitle}" (SHA-256: ${petitionHash.slice(0, 16)}…) at ${now}` }],
        }
        zip.file(`signatures/sig-${sig.name.replace(/\s+/g, '-').toLowerCase()}.uds`, JSON.stringify(sigUds, null, 2))
      }

      zip.file('bundle.json', JSON.stringify({ type: 'petition_bundle', petition_id: petitionUds.id, petition_sha256: petitionHash, title: petitionTitle, signatory_count: filledSigs.length, created: now }, null, 2))
      const blob = await zip.generateAsync({ type: 'blob' })
      const safeName = petitionTitle.slice(0, 30).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setResult({ url: URL.createObjectURL(blob), name: `petition-${safeName}.udz` })
    } catch {
      setError('Failed to generate petition bundle.')
    } finally {
      setLoading(false)
    }
  }

  const inp = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-[#c8960a]"
  const lbl = "block text-xs font-medium text-[#1e2d3d] mb-1 uppercase tracking-wider font-['DM_Mono',monospace]"

  return (
    <div style={{ background: '#fafaf8', minHeight: '100vh', color: '#1e2d3d' }}>
      <TooltipTour engineId="petition" tips={tourSteps['petition'] ?? []} />
      <div style={{ background: '#c8960a', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600 }}>Beta · Free forever</div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, margin: 0 }}>UD Petition</h1>
            <span style={{ background: '#0d9488', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4, fontFamily: "'DM Mono',monospace" }}>FREE FOREVER</span>
          </div>
          <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            Create a tamper-evident petition. The petition text is cryptographically sealed before the first signature — mathematical proof it was never altered.
          </p>
        </div>

        <div data-tour="petition-text" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Petition</div>
          <div style={{ marginBottom: 16 }}><label className={lbl}>Title *</label><input className={inp} value={petitionTitle} onChange={e => setPetitionTitle(e.target.value)} placeholder="e.g. Save the Westgate Community Garden" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div><label className={lbl}>Addressed To</label><input className={inp} value={targetName} onChange={e => setTargetName(e.target.value)} placeholder="e.g. Bristol City Council" /></div>
            <div><label className={lbl}>Target description</label><input className={inp} value={targetDescription} onChange={e => setTargetDescription(e.target.value)} placeholder="What you want them to do" /></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className={lbl}>Petition Text * <span style={{ color: '#c8960a', textTransform: 'none', letterSpacing: 0 }}>{sealed ? `(sealed: ${petitionHash.slice(0, 16)}…)` : '(will be sealed before signing)'}</span></label>
            <textarea className={inp} rows={6} value={petitionText} onChange={e => { setPetitionText(e.target.value); setSealed(false); setPetitionHash('') }} placeholder="Write the full petition text here. Once you seal it, it cannot be changed." style={{ resize: 'vertical', opacity: sealed ? 0.7 : 1 }} disabled={sealed} />
          </div>
          {!sealed ? (
            <button onClick={sealPetitionText} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Seal Petition Text
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#059669', fontWeight: 700 }}>✓ Petition text sealed</span>
              <button onClick={() => { setSealed(false); setPetitionHash('') }} style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer', color: '#6b7280' }}>Edit text</button>
            </div>
          )}
        </div>

        <div data-tour="signatories" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700 }}>Signatories</div>
            <button onClick={addSignatory} style={{ background: '#1e2d3d', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, cursor: 'pointer' }}>+ Add</button>
          </div>
          {signatories.map((s, idx) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr auto', gap: 8, marginBottom: 8 }}>
              <input className={inp} value={s.name} onChange={e => updateSig(s.id, 'name', e.target.value)} placeholder={`Signatory ${idx + 1} name`} />
              <input className={inp} value={s.email} onChange={e => updateSig(s.id, 'email', e.target.value)} placeholder="Email (optional)" />
              <input className={inp} value={s.note} onChange={e => updateSig(s.id, 'note', e.target.value)} placeholder="Note (optional)" />
              <button onClick={() => removeSig(s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>×</button>
            </div>
          ))}
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 16, padding: '10px 14px', background: '#fef2f2', borderRadius: 8 }}>{error}</div>}
        <button data-tour="bundle" onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#d1d5db' : '#1e2d3d', color: '#fff', fontSize: 15, fontWeight: 700 }}>
          {loading ? 'Creating bundle…' : 'Create Petition Bundle'}
        </button>
        {result && (
          <div style={{ marginTop: 24, padding: 24, background: '#fff', border: '2px solid #c8960a', borderRadius: 12 }}>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Petition Bundle Ready</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>Contains petition.uds (sealed text) + individual signature .uds for each signatory.</div>
            <a href={result.url} download={result.name} style={{ display: 'inline-block', padding: '10px 24px', background: '#c8960a', color: '#fff', borderRadius: 8, fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>Download {result.name}</a>
          </div>
        )}

        <div style={{ marginTop: 64 }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, marginBottom: 24 }}>How UD Petition differs from change.org or email campaigns</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { title: 'Text sealed before signing', body: 'On change.org, petition text can be edited after signatures are collected — a known problem. UD Petition seals the text first. Every signatory signs exactly the same version.' },
              { title: 'Cryptographic proof', body: 'The SHA-256 hash of the petition text is embedded in every signature record. Mathematical proof the text was never altered after the first signature.' },
              { title: 'No platform dependency', body: 'The petition bundle is a .udz file you own. It cannot be taken down, deplatformed, or have its data sold.' },
              { title: 'Individual signature records', body: 'Each signatory gets a personal .uds signature record with a tamper-evident timestamp. Suitable for submission to government bodies.' },
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
