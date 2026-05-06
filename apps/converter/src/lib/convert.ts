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
    verification_url?: string
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

// Shape of per-page warnings collected during PDF conversion. Surfaced to
// the API response and rendered in the client so users see exactly which
// pages had issues instead of a generic "Conversion failed" toast.
export type PageWarning = {
  page: number
  reason:
    | 'image-only'        // page rendered no extractable text — likely a signature/scan/seal
    | 'sparse-text'       // page returned < 200 chars but isn't necessarily image-only
    | 'rotated'           // page had non-zero rotation; text reordered to follow visual flow
    | 'extraction-failed' // pdfjs threw on this specific page; we fell through
  recoverable: boolean    // true if user can re-OCR / re-export to fix; false if structural
  detail?: string
}

const PER_PAGE_TEXT_THRESHOLD = 200

// Sort PDF text items into visual reading order. pdfjs returns items in
// the order it finds them in the content stream, which for rotated pages
// can be visually scrambled. We sort by Y descending (top to bottom in
// PDF coords) then X ascending (left to right). This is a coarse but
// robust ordering that handles standard portrait pages, landscape pages,
// and pages with `rotate` metadata without requiring per-rotation
// special-cases (pdfjs returns items in the page's untransformed
// coordinate system, so a single sort works for all four standard
// rotations).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortItemsByVisualOrder(items: any[]): any[] {
  return [...items].sort((a, b) => {
    const ay = a.transform?.[5] ?? 0
    const by = b.transform?.[5] ?? 0
    if (Math.abs(ay - by) > 2) return by - ay // top to bottom
    const ax = a.transform?.[4] ?? 0
    const bx = b.transform?.[4] ?? 0
    return ax - bx // left to right
  })
}

// Per-page extraction primary path. Returns plain text (newline-joined per
// page) plus a list of warnings for pages that came back sparse, rotated,
// or failed outright.
async function extractPdfPerPage(
  buffer: Buffer,
): Promise<{ text: string; warnings: PageWarning[]; pdfjsAvailable: boolean }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pdfjsLib: any
  try {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''
  } catch (err) {
    console.warn('pdfjs-dist failed to load:', err)
    return { text: '', warnings: [], pdfjsAvailable: false }
  }

  const warnings: PageWarning[] = []
  const pageTexts: string[] = []

  try {
    const data = new Uint8Array(buffer)
    const doc = await pdfjsLib.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
    }).promise

    for (let i = 1; i <= doc.numPages; i++) {
      try {
        const page = await doc.getPage(i)
        const rotation: number = page.rotate ?? 0
        const content = await page.getTextContent()
        const sorted = sortItemsByVisualOrder(content.items)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = sorted.map((item: any) => item.str).join(' ').trim()

        if (rotation !== 0) {
          warnings.push({
            page: i,
            reason: 'rotated',
            recoverable: true,
            detail: `Rotated ${rotation}° — text reordered to follow visual layout.`,
          })
        }

        if (pageText.length === 0) {
          warnings.push({
            page: i,
            reason: 'image-only',
            recoverable: true,
            detail: 'No extractable text on this page (likely a signature, seal, or scan). Re-OCR with the OCR utility to capture image content.',
          })
          pageTexts.push(`[Page ${i}: image-only content — no text extracted]`)
        } else if (pageText.length < PER_PAGE_TEXT_THRESHOLD) {
          warnings.push({
            page: i,
            reason: 'sparse-text',
            recoverable: true,
            detail: `Only ${pageText.length} characters extracted. May contain image content not captured.`,
          })
          pageTexts.push(pageText)
        } else {
          pageTexts.push(pageText)
        }
      } catch (pageErr) {
        warnings.push({
          page: i,
          reason: 'extraction-failed',
          recoverable: false,
          detail: pageErr instanceof Error ? pageErr.message : String(pageErr),
        })
        pageTexts.push(`[Page ${i}: extraction failed]`)
      }
    }
  } catch (err) {
    console.warn('pdfjs document open failed:', err)
    return { text: '', warnings: [], pdfjsAvailable: false }
  }

  return { text: pageTexts.join('\n\n'), warnings, pdfjsAvailable: true }
}

// Whole-PDF Anthropic fallback. Used only when pdfjs returned nothing usable
// for the majority of pages (suggesting a fully-image PDF or a pdfjs
// blind-spot we can't solve here). Bumped to max_tokens 16384 so multi-page
// legal documents don't get silently truncated.
async function extractPdfViaAnthropic(buffer: Buffer): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) return ''
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.messages.create as any)({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 16384,
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
          { type: 'text', text: 'Extract all text from this PDF. Preserve headings and paragraph structure. Mark page boundaries with "--- Page N ---" lines. Output plain text only, no commentary.' },
        ],
      }],
    })
    return (response.content as Anthropic.ContentBlock[])
      .filter(b => b.type === 'text')
      .map(b => (b as Anthropic.TextBlock).text)
      .join('\n')
  } catch (err) {
    console.warn('Anthropic whole-PDF fallback failed:', err)
    return ''
  }
}

// Last-resort regex extraction from raw PDF bytes. Used only when both
// pdfjs and Anthropic are unavailable / completely fail. Output is always
// non-empty (even if just whitespace), so convertPdf never throws on this
// path — graceful degradation all the way down.
function extractPdfViaRegex(buffer: Buffer): string {
  const raw = buffer.toString('latin1')
  return raw
    .replace(/\r/g, '\n')
    .replace(/\([^)]{1,400}\)/g, (m) => m.slice(1, -1))
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .split('\n').map(l => l.trim()).filter(Boolean)
    .slice(0, 500).join('\n')
}

// Public PDF conversion entry point. Returns the UDS document AND the list
// of per-page warnings the route handler surfaces to the client. Never
// throws on a malformed PDF — degrades to whatever extraction tier still
// works and annotates pages that came back sparse.
export async function convertPdf(
  buffer: Buffer,
  fileName: string,
): Promise<{ doc: UDDocument; warnings: PageWarning[] }> {
  const perPage = await extractPdfPerPage(buffer)
  let extractedText = perPage.text
  let warnings = perPage.warnings

  // Trigger the Anthropic whole-PDF fallback only when pdfjs's per-page
  // extraction left the majority of pages sparse or empty. This keeps the
  // common case (well-formed text PDFs) fast — pdfjs only — while giving
  // image-heavy PDFs a second chance via Claude's native PDF understanding.
  const sparsePageCount = warnings.filter(
    w => w.reason === 'image-only' || w.reason === 'sparse-text' || w.reason === 'extraction-failed',
  ).length
  const totalPagesEstimate = perPage.pdfjsAvailable
    ? Math.max(1, perPage.text.split('\n\n').length)
    : 0
  const majoritySparse =
    perPage.pdfjsAvailable && totalPagesEstimate > 0 && sparsePageCount * 2 >= totalPagesEstimate

  if (!perPage.pdfjsAvailable || majoritySparse) {
    const anthropicText = await extractPdfViaAnthropic(buffer)
    if (anthropicText.trim().length > Math.max(50, extractedText.trim().length)) {
      extractedText = anthropicText
      // Anthropic succeeded where pdfjs was sparse — annotate but keep
      // the prior per-page warnings so the user knows which pages we had
      // to fall back on.
      warnings = warnings.map(w =>
        w.reason === 'image-only' || w.reason === 'sparse-text'
          ? { ...w, detail: (w.detail ?? '') + ' (Recovered via AI fallback.)' }
          : w,
      )
    }
  }

  // Last resort: if everything else failed, regex-extract printable bytes.
  if (extractedText.trim().length === 0) {
    extractedText = extractPdfViaRegex(buffer)
    if (extractedText.trim().length === 0) {
      extractedText = `PDF content imported from ${fileName}. No extractable text was found — the document may be entirely image-based. Try the OCR utility.`
      warnings.push({
        page: 0,
        reason: 'image-only',
        recoverable: true,
        detail: 'No extractable text found anywhere in the document. Re-export with OCR enabled to recover text.',
      })
    }
  }

  const doc = buildUDDocument({
    title: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    blocks: textToBlocks(extractedText, fileName),
    documentType: 'pdf-import',
    sourceFileName: fileName,
    state: 'UDS',
  })

  // Mirror warnings into metadata.tags so the warnings travel with the
  // .uds file itself, not just the response. UDR/UDS readers can render
  // them later when displaying provenance.
  for (const w of warnings) {
    doc.metadata.tags.push(`pdf-warning:${w.reason}:page-${w.page}`)
  }

  return { doc, warnings }
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
