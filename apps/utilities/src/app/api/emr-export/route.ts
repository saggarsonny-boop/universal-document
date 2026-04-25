import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const PROMPT = `You are a clinical data conversion specialist. Parse this EMR/health record (HL7, FHIR, C-CDA, CCD, or plain text) and extract structured information.

Return ONLY a JSON object (no markdown):
{
  "patient": { "name": "...", "dob": "YYYY-MM-DD", "id": "...", "gender": "..." },
  "diagnoses": [{ "code": "ICD-10 if found", "description": "..." }],
  "medications": [{ "name": "...", "dose": "...", "frequency": "..." }],
  "allergies": ["..."],
  "procedures": [{ "date": "...", "description": "..." }],
  "vitals": { "recorded_at": "...", "bp": "...", "hr": "...", "weight": "...", "height": "..." },
  "patient_summary": "<plain language 2-3 sentence summary for patient>",
  "clinical_summary": "<structured clinical summary for clinician, SOAP-style>",
  "source_format": "HL7|FHIR|C-CDA|CCD|plain"
}`

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })

    const text = await file.text()
    if (!text.trim()) return NextResponse.json({ error: 'No content found in file.' }, { status: 400 })

    const message = await client.messages.create({
      model: 'claude-opus-4-5', max_tokens: 2048,
      messages: [{ role: 'user', content: `${PROMPT}\n\n---\n\n${text.slice(0, 12000)}` }],
    })
    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let parsed: Record<string, unknown>
    try { parsed = JSON.parse(raw) } catch { return NextResponse.json({ error: 'Model returned unexpected format.' }, { status: 500 }) }

    const now = new Date().toISOString()
    const udsDoc = {
      format: 'UDS', status: 'sealed',
      title: `EMR Export — ${(parsed.patient as Record<string, unknown>)?.name ?? 'Patient'}`,
      document_type: 'emr_export',
      source_format: parsed.source_format,
      patient: parsed.patient,
      diagnoses: parsed.diagnoses,
      medications: parsed.medications,
      allergies: parsed.allergies,
      procedures: parsed.procedures,
      vitals: parsed.vitals,
      clarity_layers: {
        patient_summary: { generated_at: now, model: 'claude-opus-4-5', text: parsed.patient_summary },
        clinical_summary: { generated_at: now, model: 'claude-opus-4-5', text: parsed.clinical_summary },
      },
      provenance: { created_at: now, source_file: file.name, source_format: parsed.source_format, converted_by: 'claude-opus-4-5' },
    }
    return NextResponse.json({ parsed, uds: JSON.stringify(udsDoc, null, 2), filename: file.name.replace(/\.[^.]+$/, '') + '-emr.uds' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'EMR export failed' }, { status: 500 })
  }
}
