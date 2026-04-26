import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'

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
    const patientName = (parsed.patient as Record<string, unknown>)?.name as string ?? 'Patient'
    const docId = crypto.randomUUID()

    const diagnosisBlocks = ((parsed.diagnoses || []) as Array<{ code?: string; description: string }>).map((d, i) => ({
      id: `dx-${i}`,
      type: 'paragraph' as const,
      base_content: { text: d.code ? `${d.code}: ${d.description}` : d.description },
    }))

    const medicationBlocks = ((parsed.medications || []) as Array<{ name: string; dose?: string; frequency?: string }>).map((m, i) => ({
      id: `med-${i}`,
      type: 'paragraph' as const,
      base_content: { text: [m.name, m.dose, m.frequency].filter(Boolean).join(' ') },
    }))

    const blocks = [
      { id: 'h-patient', type: 'heading' as const, base_content: { text: `EMR Export — ${patientName}` } },
      ...(parsed.patient_summary ? [{ id: 'patient-summary', type: 'paragraph' as const, base_content: { text: parsed.patient_summary as string } }] : []),
      ...(diagnosisBlocks.length > 0 ? [{ id: 'h-dx', type: 'heading' as const, base_content: { text: 'Diagnoses' } }, ...diagnosisBlocks] : []),
      ...(medicationBlocks.length > 0 ? [{ id: 'h-meds', type: 'heading' as const, base_content: { text: 'Medications' } }, ...medicationBlocks] : []),
      ...(parsed.clinical_summary ? [
        { id: 'h-clinical', type: 'heading' as const, base_content: { text: 'Clinical Summary' } },
        { id: 'clinical-summary', type: 'paragraph' as const, base_content: { text: parsed.clinical_summary as string } },
      ] : []),
    ]

    const hash = createHash('sha256').update(JSON.stringify(blocks)).digest('hex')

    const udsDoc = {
      ud_version: '1.0.0',
      state: 'UDS' as const,
      metadata: {
        id: docId,
        title: `EMR Export — ${patientName}`,
        created_at: now,
        updated_at: now,
        created_by: 'UD EMR Exporter',
        document_type: 'emr_export',
        tags: ['medical', 'emr', (parsed.source_format as string) || 'clinical'],
        revoked: false,
      },
      manifest: {
        base_language: 'en',
        language_manifest: [{ code: 'en', label: 'English', direction: 'ltr' }],
        clarity_layer_manifest: [],
        permissions: { allow_copy: false, allow_print: true, allow_export: false, require_auth: true },
      },
      blocks,
      seal: {
        sealed_at: now,
        sealed_by: 'UD EMR Exporter',
        hash,
        chain_of_custody: [
          { event: 'created', actor: 'UD EMR Exporter', timestamp: now },
          { event: 'sealed', actor: 'UD EMR Exporter', timestamp: now },
        ],
      },
    }

    return NextResponse.json({ parsed, uds: JSON.stringify(udsDoc, null, 2), filename: file.name.replace(/\.[^.]+$/, '') + '-emr.uds' })
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'EMR export failed' }, { status: 500 })
  }
}
