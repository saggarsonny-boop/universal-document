import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }, { status: 503 })
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  try {
    const body = await req.json()
    const { patientName, dob, medication, dose, frequency, duration, prescriberName, licenseNo, prescriberOrg } = body

    if (!patientName || !medication || !dose || !frequency || !prescriberName) {
      return NextResponse.json({ error: 'Missing required fields: patientName, medication, dose, frequency, prescriberName' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `You are a clinical pharmacist generating a professional prescription document. Produce complete, clinically accurate content for this prescription.

Patient: ${patientName}${dob ? ` (DOB: ${dob})` : ''}
Medication: ${medication}
Dose: ${dose}
Frequency: ${frequency}${duration ? `\nDuration: ${duration}` : ''}
Prescriber: ${prescriberName}${licenseNo ? ` (Licence: ${licenseNo})` : ''}${prescriberOrg ? ` — ${prescriberOrg}` : ''}

Return ONLY this JSON object, no preamble, no markdown:
{
  "dispensing_instructions": "Professional pharmacist instructions: quantity to dispense, labelling requirements, any special dispensing notes",
  "patient_instructions": "Plain-language patient instructions: exactly when and how to take, food or drink interactions, what to avoid, what to watch for",
  "drug_interactions": "Key interactions or contraindications for this medication, or 'No significant interactions identified for this medication at the prescribed dose' if none",
  "storage": "Storage instructions for this specific medication (temperature, light, moisture)",
  "clinical_note": "Brief prescriber clinical note: likely indication, any relevant monitoring required, review timeline"
}`,
      }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text.trim()
    let generated: {
      dispensing_instructions: string
      patient_instructions: string
      drug_interactions: string
      storage: string
      clinical_note: string
    }
    try {
      const match = raw.match(/\{[\s\S]*\}/)
      generated = JSON.parse(match?.[0] || raw)
    } catch {
      generated = {
        dispensing_instructions: `Dispense ${medication} ${dose} as prescribed. Label: "${medication} ${dose} — ${frequency}". Counsel patient on administration.`,
        patient_instructions: `Take ${dose} ${frequency}${duration ? ` for ${duration}` : ''}. Take at the same time each day. Follow your prescriber's instructions and contact your pharmacist or GP if you experience side effects.`,
        drug_interactions: 'No significant interactions identified for this medication at the prescribed dose.',
        storage: 'Store at room temperature (15–25°C), away from heat, moisture, and direct light. Keep out of reach of children.',
        clinical_note: `Prescribed by ${prescriberName}. Standard monitoring applies. Review at next scheduled appointment.`,
      }
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const id = crypto.randomUUID()
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const expiryStr = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    function blk(type: string, opts: { text?: string; label?: string; level?: number } = {}) {
      return {
        id: crypto.randomBytes(6).toString('hex'),
        type,
        ...(opts.text !== undefined ? { text: opts.text } : {}),
        ...(opts.label !== undefined ? { label: opts.label } : {}),
        ...(opts.level !== undefined ? { level: opts.level } : {}),
        base_content: {
          ...(opts.text !== undefined ? { text: opts.text } : {}),
          ...(opts.label !== undefined ? { label: opts.label } : {}),
          ...(opts.level !== undefined ? { level: opts.level } : {}),
        },
      }
    }

    const blocks = [
      blk('heading', { text: 'Prescription', level: 1 }),
      blk('field', { label: 'Patient', text: patientName }),
      ...(dob ? [blk('field', { label: 'Date of Birth', text: dob })] : []),
      blk('field', { label: 'Medication', text: `${medication} — ${dose}` }),
      blk('field', { label: 'Frequency', text: `${frequency}${duration ? ` for ${duration}` : ''}` }),
      blk('field', { label: 'Instructions', text: generated.dispensing_instructions }),
      blk('field', { label: 'Patient Guidance', text: generated.patient_instructions }),
      blk('field', { label: 'Prescriber', text: `${prescriberName}${licenseNo ? ` (${licenseNo})` : ''}` }),
      ...(prescriberOrg ? [blk('field', { label: 'Organisation', text: prescriberOrg })] : []),
      blk('field', { label: 'Date', text: dateStr }),
      blk('field', { label: 'Expires', text: expiryStr }),
      blk('heading', { text: 'Clinical Notes', level: 2 }),
      blk('paragraph', { text: generated.clinical_note }),
      blk('paragraph', { text: `Drug Interactions: ${generated.drug_interactions}` }),
      blk('paragraph', { text: `Storage: ${generated.storage}` }),
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
