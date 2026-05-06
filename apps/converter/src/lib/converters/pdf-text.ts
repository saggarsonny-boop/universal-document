// PDF → text and PDF → DOCX via pdfjs-dist.
//
// Reuses PR #2's per-page extraction pattern (sortItemsByVisualOrder for
// rotated pages, per-page warnings for image-only pages, graceful
// degradation). For PDF → DOCX we render extracted text into HTML
// paragraphs then run html-to-docx to produce the final .docx binary.

// IMPORTANT: side-effect import installs the DOMMatrix polyfill on
// globalThis BEFORE pdfjs-dist loads. pdfjs-dist 5.x assumes a browser
// environment and references DOMMatrix during text extraction; without
// this polyfill, every getTextContent() call throws "DOMMatrix is not
// defined" in the Vercel Node runtime.
import '../polyfills/dom-matrix'

import type { Converter } from './types'
import { thrownToFailure } from './types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortItemsByVisualOrder(items: any[]): any[] {
  return [...items].sort((a, b) => {
    const ay = a.transform?.[5] ?? 0
    const by = b.transform?.[5] ?? 0
    if (Math.abs(ay - by) > 2) return by - ay
    const ax = a.transform?.[4] ?? 0
    const bx = b.transform?.[4] ?? 0
    return ax - bx
  })
}

async function extractPdfPagesAsText(buffer: Buffer): Promise<{
  pages: string[]
  warnings: string[]
  pageCount: number
}> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjsLib.GlobalWorkerOptions.workerSrc = ''
  const data = new Uint8Array(buffer)
  const doc = await pdfjsLib.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise

  const pages: string[] = []
  const warnings: string[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    try {
      const page = await doc.getPage(i)
      const rotation: number = page.rotate ?? 0
      const content = await page.getTextContent()
      const sorted = sortItemsByVisualOrder(content.items)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = sorted.map((it: any) => it.str).join(' ').trim()
      if (rotation !== 0) warnings.push(`Page ${i}: rotated ${rotation}° — text reordered to follow visual layout.`)
      if (pageText.length === 0) {
        warnings.push(`Page ${i}: image-only content — no extractable text. Re-OCR with the OCR utility to capture image content.`)
        pages.push(`[Page ${i}: image-only content]`)
      } else {
        pages.push(pageText)
      }
    } catch (pageErr) {
      warnings.push(`Page ${i}: extraction failed — ${pageErr instanceof Error ? pageErr.message : String(pageErr)}`)
      pages.push(`[Page ${i}: extraction failed]`)
    }
  }
  return { pages, warnings, pageCount: doc.numPages }
}

export const pdfToText: Converter = async (input, options) => {
  try {
    const { pages, warnings, pageCount } = await extractPdfPagesAsText(input)
    const text = pages.join('\n\n--- Page break ---\n\n')
    return {
      ok: true,
      buffer: Buffer.from(text, 'utf-8'),
      contentType: 'text/plain',
      warnings: warnings.length > 0 ? warnings : undefined,
      pageCount,
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const pdfToDocx: Converter = async (input, options) => {
  try {
    const { pages, warnings, pageCount } = await extractPdfPagesAsText(input)
    // Build minimal HTML: each page becomes a section with paragraphs.
    // html-to-docx will render this into a Word doc with corresponding
    // page breaks (manually inserted via <br style="page-break-before:always"/>).
    const htmlSections = pages.map((pageText, idx) => {
      const paragraphs = pageText
        .split(/\n{2,}/)
        .map(p => p.trim())
        .filter(Boolean)
        .map(p => `<p>${escapeHtml(p)}</p>`)
        .join('\n')
      const pageBreak = idx > 0 ? '<br style="page-break-before:always"/>' : ''
      return `${pageBreak}<section>${paragraphs}</section>`
    })
    const html = `<!DOCTYPE html><html><body>${htmlSections.join('\n')}</body></html>`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const htmlToDocxModule: any = await import('html-to-docx')
    const htmlToDocx = htmlToDocxModule.default || htmlToDocxModule
    const docxBuf = (await htmlToDocx(html, undefined, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    })) as Buffer | ArrayBuffer
    const buffer = Buffer.isBuffer(docxBuf) ? docxBuf : Buffer.from(docxBuf as ArrayBuffer)
    return {
      ok: true,
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      warnings: warnings.length > 0 ? warnings : undefined,
      pageCount,
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
