import { v4 as uuidv4 } from 'uuid'
import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'

export interface UDBlock {
  id: string
  type: 'paragraph' | 'heading' | 'list' | 'divider'
  base_content: Record<string, unknown>
  provenance?: { source: string; imported_from: string; imported_at: string }
}

export interface UDDocument {
  ud_version: string
  state: 'UDR' | 'UDS'
  metadata: {
    id: string
    title: string
    created_at: string
    updated_at: string
    created_by: string
    organisation?: string
    document_type: string
    tags: string[]
    revoked: boolean
  }
  manifest: {
    base_language: string
    language_manifest: Array<{ code: string; label: string; direction?: string }>
    clarity_layer_manifest: Array<{ id: string; label: string }>
    permissions: {
      allow_copy: boolean
      allow_print: boolean
      allow_export: boolean
      require_auth: boolean
    }
  }
  blocks: UDBlock[]
  seal?: {
    sealed_at: string
    sealed_by: string
    hash: string
    chain_of_custody: Array<{
      event: 'created' | 'edited' | 'reviewed' | 'approved' | 'sealed' | 'shared' | 'revoked'
      actor: string
      timestamp: string
      note?: string
    }>
  }
}

function sealDocument(blocks: UDBlock[], now: string, sourceFileName: string): UDDocument['seal'] {
  const hash = createHash('sha256').update(JSON.stringify(blocks)).digest('hex')
  return {
    sealed_at: now,
    sealed_by: 'UD Converter',
    hash,
    chain_of_custody: [
      { event: 'created', actor: 'UD Converter', timestamp: now, note: `Converted from ${sourceFileName}` },
      { event: 'sealed', actor: 'UD Converter', timestamp: now, note: 'Auto-sealed on conversion' },
    ],
  }
}

function slugId() {
  return uuidv4().replace(/-/g, '').slice(0, 12)
}

function textToBlocks(text: string, source: string): UDBlock[] {
  const now = new Date().toISOString()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const blocks: UDBlock[] = []

  for (const line of lines) {
    const isHeading = /^(#{1,6}\s|[A-Z][A-Z\s]{3,}$)/.test(line) && line.length < 120
    const isDivider = /^[-=*]{3,}$/.test(line)

    if (isDivider) {
      blocks.push({ id: slugId(), type: 'divider', base_content: {}, provenance: { source, imported_from: source, imported_at: now } })
    } else if (isHeading) {
      blocks.push({ id: slugId(), type: 'heading', base_content: { text: line.replace(/^#{1,6}\s/, ''), level: 2 }, provenance: { source, imported_from: source, imported_at: now } })
    } else {
      blocks.push({ id: slugId(), type: 'paragraph', base_content: { text: line }, provenance: { source, imported_from: source, imported_at: now } })
    }
  }

  return blocks
}

function htmlToBlocks(html: string, source: string): UDBlock[] {
  const now = new Date().toISOString()
  const blocks: UDBlock[] = []

  const text = html
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n###HEADING###$1\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    if (line.startsWith('###HEADING###')) {
      blocks.push({ id: slugId(), type: 'heading', base_content: { text: line.replace('###HEADING###', ''), level: 2 }, provenance: { source, imported_from: source, imported_at: now } })
    } else if (line.startsWith('- ')) {
      blocks.push({ id: slugId(), type: 'paragraph', base_content: { text: line.slice(2) }, provenance: { source, imported_from: source, imported_at: now } })
    } else {
      blocks.push({ id: slugId(), type: 'paragraph', base_content: { text: line }, provenance: { source, imported_from: source, imported_at: now } })
    }
  }

  return blocks
}

export function buildUDDocument(params: {
  title: string
  blocks: UDBlock[]
  documentType: string
  sourceFileName: string
  state?: 'UDR' | 'UDS'
}): UDDocument {
  const now = new Date().toISOString()
  const state = params.state ?? 'UDS'
  return {
    ud_version: '0.1.0',
    state,
    metadata: {
      id: uuidv4(),
      title: params.title,
      created_at: now,
      updated_at: now,
      created_by: 'UD Converter',
      document_type: params.documentType,
      tags: ['converted', params.sourceFileName.split('.').pop() ?? 'doc'],
      revoked: false,
    },
    manifest: {
      base_language: 'en',
      language_manifest: [{ code: 'en', label: 'English', direction: 'ltr' }],
      clarity_layer_manifest: [],
      permissions: {
        allow_copy: true,
        allow_print: true,
        allow_export: true,
        require_auth: false,
      },
    },
    blocks: params.blocks,
    ...(state === 'UDS' ? { seal: sealDocument(params.blocks, now, params.sourceFileName) } : {}),
  }
}

export async function convertDocx(buffer: Buffer, fileName: string): Promise<UDDocument> {
  const mammoth = await import('mammoth')
  const result = await mammoth.convertToHtml({ buffer })
  const blocks = htmlToBlocks(result.value, fileName)
  const title = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  return buildUDDocument({ title, blocks, documentType: 'document', sourceFileName: fileName, state: 'UDS' })
}

export async function convertTxt(text: string, fileName: string): Promise<UDDocument> {
  const blocks = textToBlocks(text, fileName)
  const title = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  return buildUDDocument({ title, blocks, documentType: 'document', sourceFileName: fileName, state: 'UDS' })
}

export async function convertHtml(text: string, fileName: string): Promise<UDDocument> {
  const blocks = htmlToBlocks(text, fileName)
  const title = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  return buildUDDocument({ title, blocks, documentType: 'html-import', sourceFileName: fileName, state: 'UDS' })
}

export async function convertCsv(text: string, fileName: string): Promise<UDDocument> {
  const now = new Date().toISOString()
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((cell) => cell.trim()))

  const blocks: UDBlock[] = []

  if (rows.length > 0) {
    const [header, ...body] = rows
    blocks.push({
      id: slugId(),
      type: 'heading',
      base_content: { text: fileName.replace(/\.[^.]+$/, ''), level: 2 },
      provenance: { source: fileName, imported_from: fileName, imported_at: now },
    })

    blocks.push({
      id: slugId(),
      type: 'list',
      base_content: {
        header,
        rows: body,
      },
      provenance: { source: fileName, imported_from: fileName, imported_at: now },
    })
  }

  return buildUDDocument({
    title: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    blocks,
    documentType: 'spreadsheet',
    sourceFileName: fileName,
    state: 'UDS',
  })
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Primary: Claude native PDF understanding — best for formatted documents
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (client.messages.create as any)({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: buffer.toString('base64'),
              },
            },
            { type: 'text', text: 'Extract all text from this PDF. Preserve headings and paragraph structure. Output plain text only, no commentary.' },
          ],
        }],
      })
      const text = (response.content as Anthropic.ContentBlock[])
        .filter(b => b.type === 'text')
        .map(b => (b as Anthropic.TextBlock).text)
        .join('\n')
      if (text.trim().length > 50) return text
    } catch (err) {
      console.warn('Anthropic PDF extraction failed, trying pdfjs:', err)
    }
  }

  // Fallback: pdfjs-dist (dynamic import so load failures are isolated)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs') as any
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''
    const data = new Uint8Array(buffer)
    const doc = await pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false }).promise
    let fullText = ''
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fullText += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    if (fullText.trim().length > 50) return fullText
  } catch (err) {
    console.warn('pdfjs extraction failed, using regex fallback:', err)
  }

  // Last resort: regex extraction from raw PDF bytes
  const raw = buffer.toString('latin1')
  return raw
    .replace(/\r/g, '\n')
    .replace(/\([^)]{1,400}\)/g, (m) => m.slice(1, -1))
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .split('\n').map(l => l.trim()).filter(Boolean)
    .slice(0, 500).join('\n')
}

export async function convertPdf(buffer: Buffer, fileName: string): Promise<UDDocument> {
  let extractedText = ''

  try {
    extractedText = await extractTextFromPDF(buffer)
  } catch (err) {
    console.warn('pdfjs-dist extraction failed, using regex fallback:', err)
    const raw = buffer.toString('latin1')
    extractedText = raw
      .replace(/\r/g, '\n')
      .replace(/\([^)]{1,400}\)/g, (m) => m.slice(1, -1))
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 500)
      .join('\n')
  }

  const blocks = textToBlocks(extractedText || `PDF content imported from ${fileName}`, fileName)
  return buildUDDocument({
    title: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    blocks,
    documentType: 'pdf-import',
    sourceFileName: fileName,
    state: 'UDS',
  })
}

export async function convertXlsx(buffer: Buffer, fileName: string): Promise<UDDocument> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const now = new Date().toISOString()
  const blocks: UDBlock[] = []

  for (const sheetName of workbook.SheetNames) {
    blocks.push({
      id: slugId(), type: 'heading',
      base_content: { text: sheetName, level: 2 },
      provenance: { source: fileName, imported_from: fileName, imported_at: now },
    })
    const sheet = workbook.Sheets[sheetName]
    const csv = XLSX.utils.sheet_to_csv(sheet)
    const rows = csv.split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split(',').map(c => c.trim()))
    if (rows.length > 0) {
      const [header, ...body] = rows
      blocks.push({
        id: slugId(), type: 'list',
        base_content: { header, rows: body },
        provenance: { source: fileName, imported_from: fileName, imported_at: now },
      })
    }
  }

  return buildUDDocument({
    title: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    blocks: blocks.length ? blocks : textToBlocks(`Empty spreadsheet: ${fileName}`, fileName),
    documentType: 'spreadsheet',
    sourceFileName: fileName,
    state: 'UDS',
  })
}

export async function convertImage(fileName: string): Promise<UDDocument> {
  const content = [
    `Image input imported: ${fileName}`,
    'OCR utility can be selected in preprocessing for text extraction intent.',
    'No binary payload is embedded in this document.',
  ].join('\n')
  const blocks = textToBlocks(content, fileName)
  return buildUDDocument({
    title: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    blocks,
    documentType: 'image-import',
    sourceFileName: fileName,
    state: 'UDS',
  })
}
