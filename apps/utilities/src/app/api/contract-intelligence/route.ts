import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable — configuration issue. Please contact support.' }), { status: 503 })
  }
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const form = await req.formData()
  const file = form.get('file') as File | null
  const contractType = (form.get('contractType') as string) || 'Other'

  if (!file) return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 })

  let contractText = ''
  try {
    contractText = await file.text()
  } catch {
    return new Response(JSON.stringify({ error: 'Could not read file' }), { status: 400 })
  }

  const prompt = `You are a contract intelligence specialist. Analyze this ${contractType} contract and extract structured information.

CONTRACT TEXT:
${contractText.slice(0, 12000)}

Extract and return a JSON object with this exact structure:
{
  "summary": "2-3 sentence executive summary",
  "parties": [{"name": "string", "role": "string"}],
  "key_dates": [{"label": "string", "date": "string", "description": "string"}],
  "obligations": [{"party": "string", "obligation": "string", "deadline": "string or null"}],
  "financial_terms": [{"label": "string", "amount": "string", "frequency": "string or null"}],
  "liability_cap": "string or null",
  "governing_law": "string or null",
  "confidentiality": "string describing confidentiality obligations or null",
  "ip_ownership": "string describing IP ownership or null",
  "risk_flags": [{"severity": "high|medium|low", "flag": "string", "recommendation": "string"}],
  "termination": {"notice_period": "string or null", "grounds": ["string"]}
}

Return ONLY the JSON object, no other text.`

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (msg.content[0] as { type: string; text: string }).text.trim()
    let analysis: Record<string, unknown>
    try {
      const jsonStart = raw.indexOf('{')
      const jsonEnd = raw.lastIndexOf('}') + 1
      analysis = JSON.parse(raw.slice(jsonStart, jsonEnd))
    } catch {
      analysis = { summary: raw, risk_flags: [], key_dates: [], obligations: [] }
    }

    const now = new Date().toISOString()
    const fileName = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')

    const riskBlocks = ((analysis.risk_flags as Array<{ severity: string; flag: string; recommendation: string }>) || []).map((r, i) => ({
      id: `risk-${i + 1}`,
      type: 'paragraph' as const,
      base_content: { text: `[${r.severity?.toUpperCase() || 'INFO'}] ${r.flag} — ${r.recommendation}` },
    }))

    const dateBlocks = ((analysis.key_dates as Array<{ label: string; date: string; description: string }>) || []).map((d, i) => ({
      id: `date-${i + 1}`,
      type: 'paragraph' as const,
      base_content: { text: `${d.label}: ${d.date}${d.description ? ` — ${d.description}` : ''}` },
    }))

    const obligationBlocks = ((analysis.obligations as Array<{ party: string; obligation: string; deadline: string | null }>) || []).map((o, i) => ({
      id: `obl-${i + 1}`,
      type: 'paragraph' as const,
      base_content: { text: `${o.party}: ${o.obligation}${o.deadline ? ` (by ${o.deadline})` : ''}` },
    }))

    const blocks = [
      { id: 'h1', type: 'heading' as const, base_content: { text: `Contract Intelligence Report: ${fileName}` } },
      { id: 'summary', type: 'paragraph' as const, base_content: { text: (analysis.summary as string) || 'AI analysis complete.' } },
      ...(dateBlocks.length > 0 ? [{ id: 'h-dates', type: 'heading' as const, base_content: { text: 'Key Dates' } }, ...dateBlocks] : []),
      ...(obligationBlocks.length > 0 ? [{ id: 'h-obl', type: 'heading' as const, base_content: { text: 'Obligations' } }, ...obligationBlocks] : []),
      ...(riskBlocks.length > 0 ? [{ id: 'h-risks', type: 'heading' as const, base_content: { text: 'Risk Flags' } }, ...riskBlocks] : []),
    ]

    const hash = createHash('sha256').update(JSON.stringify(blocks)).digest('hex')
    const docId = crypto.randomUUID()

    const doc = {
      ud_version: '1.0.0',
      state: 'UDS',
      metadata: {
        id: docId,
        title: `Contract Intelligence: ${fileName}`,
        created_at: now,
        updated_at: now,
        created_by: 'UD Contract Intelligence',
        document_type: 'contract_intelligence',
        tags: ['contract', 'intelligence', contractType.toLowerCase()],
        revoked: false,
      },
      manifest: {
        base_language: 'en',
        language_manifest: [{ code: 'en', label: 'English', direction: 'ltr' }],
        clarity_layer_manifest: [],
        permissions: { allow_copy: true, allow_print: true, allow_export: true, require_auth: false },
      },
      blocks,
      contract_intelligence: analysis,
      seal: {
        sealed_at: now,
        sealed_by: 'UD Contract Intelligence',
        hash,
        chain_of_custody: [
          { event: 'created', actor: 'UD Contract Intelligence', timestamp: now },
          { event: 'sealed', actor: 'UD Contract Intelligence', timestamp: now },
        ],
      },
    }

    const blob = JSON.stringify(doc, null, 2)
    const safeName = fileName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase().slice(0, 48)

    return new Response(blob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="contract-intelligence-${safeName}.uds"`,
      },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Analysis failed' }), { status: 500 })
  }
}
