import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { patientName, dob, medication, dose, frequency, duration, prescriberName, licenseNo, prescriberOrg } = body

    if (!patientName || !medication || !dose || !frequency || !prescriberName) {
      return NextResponse.json({ error: 'Missing required fields: patientName, medication, dose, frequency, prescriberName' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a clinical document assistant generating a structured prescription record. Based on the details below, produce professional prescription content.

Patient: ${patientName}${dob ? ` (DOB: ${dob})` : ''}
Medication: ${medication}
Dose: ${dose}
Frequency: ${frequency}${duration ? `\nDuration: ${duration}` : ''}
Prescriber: ${prescriberName}${licenseNo ? ` (Licence: ${licenseNo})` : ''}${prescriberOrg ? ` — ${prescriberOrg}` : ''}

Return ONLY this JSON object, no preamble:
{
  "instructions": "Dispensing instructions for the pharmacist (one clear paragraph)",
  "patient_instructions": "Plain-language instructions for the patient: when to take, food considerations, what to watch for",
  "prescriber_note": "Brief clinical note: indication and any relevant context",
  "dispensing_authority": "Validity period and any dispensing restrictions"
}`,
      }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let generated: { instructions: string; patient_instructions: string; prescriber_note: string; dispensing_authority: string }
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      generated = JSON.parse(match?.[0] || raw)
    } catch {
      generated = {
        instructions: `Dispense ${medication} ${dose} as prescribed.`,
        patient_instructions: `Take ${dose} ${frequency}${duration ? ` for ${duration}` : ''}. Follow your prescriber's advice.`,
        prescriber_note: `Prescribed by ${prescriberName}.`,
        dispensing_authority: 'Valid for 30 days from date of issue. Single dispense only.',
      }
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const id = crypto.randomUUID()

    const blocks = [
      { id: crypto.randomBytes(6).toString('hex'), type: 'heading', base_content: { text: `Prescription — ${patientName}`, level: 1 } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'paragraph', base_content: { text: `Date: ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Prescriber: ${prescriberName}${licenseNo ? ` (${licenseNo})` : ''}${prescriberOrg ? ` — ${prescriberOrg}` : ''}` } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'heading', base_content: { text: 'Medication', level: 2 } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'paragraph', base_content: { text: `${medication} · ${dose} · ${frequency}${duration ? ` · Duration: ${duration}` : ''}` } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'heading', base_content: { text: 'Dispensing Instructions', level: 2 } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'paragraph', base_content: { text: generated.instructions } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'heading', base_content: { text: 'Patient Instructions', level: 2 } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'paragraph', base_content: { text: generated.patient_instructions } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'heading', base_content: { text: 'Clinical Note', level: 2 } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'paragraph', base_content: { text: generated.prescriber_note } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'heading', base_content: { text: 'Dispensing Authority', level: 2 } },
      { id: crypto.randomBytes(6).toString('hex'), type: 'paragraph', base_content: { text: generated.dispensing_authority } },
    ]

    const hash = crypto.createHash('sha256').update(JSON.stringify(blocks)).digest('hex')

    const doc = {
      ud_version: '1.0',
      state: 'UDS',
      metadata: {
        id,
        title: `Prescription — ${patientName} — ${medication}`,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        created_by: prescriberName,
        ...(prescriberOrg && { organisation: prescriberOrg }),
        document_type: 'prescription',
        tags: ['prescription', 'healthcare'],
        revoked: false,
        expiry: expiresAt.toISOString(),
        revocation_url: `https://utilities.hive.baby/revoke/${id}`,
      },
      manifest: {
        base_language: 'en',
        language_manifest: [{ code: 'en', label: 'English', direction: 'ltr' }],
        clarity_layer_manifest: [],
        permissions: { allow_copy: false, allow_print: true, allow_export: false, require_auth: false },
      },
      blocks,
      seal: {
        sealed_at: now.toISOString(),
        sealed_by: prescriberName,
        hash,
        chain_of_custody: [
          { event: 'created', actor: prescriberName, timestamp: now.toISOString() },
          { event: 'sealed', actor: 'UD Pharmacy Generator', timestamp: now.toISOString() },
        ],
      },
    }

    const filename = `prescription-${patientName.replace(/\s+/g, '-').toLowerCase()}.uds`
    return new Response(JSON.stringify(doc, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 })
  }
}
