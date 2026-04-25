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

    // Prompt uses numbered instructions SEPARATE from JSON output format
    // so Claude generates content, not echoes the description strings
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1200,
      messages: [{
        role: 'user',
        content: `You are a UK-registered clinical pharmacist. Generate professional prescription content for the following.

PRESCRIPTION:
Patient: ${patientName}${dob ? ` (DOB: ${dob})` : ''}
Medication: ${medication} ${dose}
Frequency: ${frequency}${duration ? `, duration: ${duration}` : ''}
Prescriber: ${prescriberName}${licenseNo ? ` (${licenseNo})` : ''}${prescriberOrg ? ` — ${prescriberOrg}` : ''}

Write each section as a qualified pharmacist would. Be specific to this drug and dose — not generic.

1. dispensing_instructions — Pharmacist's dispensing note: units to dispense for this course, exact label text as it would appear on the packaging, any controlled-drug or special-handling requirements for this specific medication.

2. patient_instructions — Patient-facing instructions: exactly when and how to take this drug, any food or drink interactions specific to this medication, what side effects to watch for, when to seek medical advice.

3. drug_interactions — Clinically significant interactions for this specific drug at this dose with common co-medications. If none relevant, write: No significant interactions identified at the prescribed dose.

4. storage — Correct storage conditions for this specific medication: temperature range, light and moisture requirements, any refrigeration needs, shelf life once opened if relevant.

5. clinical_note — Brief prescriber clinical note: the most likely indication for this drug at this dose, relevant monitoring parameters, suggested review timeline.

Output ONLY valid JSON with no other text:
{"dispensing_instructions":"...","patient_instructions":"...","drug_interactions":"...","storage":"...","clinical_note":"..."}`,
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
        patient_instructions: `Take ${dose} ${frequency}${duration ? ` for ${duration}` : ''}. Take at the same time each day. Contact your pharmacist or GP if you experience side effects.`,
        drug_interactions: 'No significant interactions identified at the prescribed dose.',
        storage: 'Store at room temperature (15–25°C), away from heat, moisture, and direct light. Keep out of reach of children.',
        clinical_note: `Prescribed by ${prescriberName}. Standard monitoring applies. Review at next scheduled appointment.`,
      }
    }

    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const id = crypto.randomUUID()
    const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const expiryStr = expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

    // Schema-compliant block builder: data only in base_content, no extra top-level props
    // Field blocks use type: 'custom' with base_content.subtype = 'field'
    const blk = (type: string, content: Record<string, unknown>) => ({
      id: crypto.randomBytes(6).toString('hex'),
      type,
      base_content: content,
    })

    const blocks = [
      blk('heading', { text: 'Prescription', level: 1 }),
      blk('custom', { subtype: 'field', label: 'Patient', text: patientName }),
      ...(dob ? [blk('custom', { subtype: 'field', label: 'Date of Birth', text: dob })] : []),
      blk('custom', { subtype: 'field', label: 'Medication', text: `${medication} — ${dose}` }),
      blk('custom', { subtype: 'field', label: 'Frequency', text: `${frequency}${duration ? ` for ${duration}` : ''}` }),
      blk('custom', { subtype: 'field', label: 'Instructions', text: generated.dispensing_instructions }),
      blk('custom', { subtype: 'field', label: 'Patient Guidance', text: generated.patient_instructions }),
      blk('custom', { subtype: 'field', label: 'Prescriber', text: `${prescriberName}${licenseNo ? ` (${licenseNo})` : ''}` }),
      ...(prescriberOrg ? [blk('custom', { subtype: 'field', label: 'Organisation', text: prescriberOrg })] : []),
      blk('custom', { subtype: 'field', label: 'Date', text: dateStr }),
      blk('custom', { subtype: 'field', label: 'Expires', text: expiryStr }),
      blk('heading', { text: 'Clinical Notes', level: 2 }),
      blk('paragraph', { text: generated.clinical_note }),
      blk('paragraph', { text: `Drug Interactions: ${generated.drug_interactions}` }),
      blk('paragraph', { text: `Storage: ${generated.storage}` }),
    ]

    const hash = crypto.createHash('sha256').update(JSON.stringify(blocks)).digest('hex')

    const doc = {
      ud_version: '1.0.0',
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
