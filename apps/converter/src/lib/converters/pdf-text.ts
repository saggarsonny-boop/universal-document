// PDF → text and PDF → DOCX via unpdf.
//
// unpdf is a Node-friendly wrapper around pdfjs-dist that handles the
// browser-global polyfills, worker setup, and import-resolution quirks
// internally. Swapped in for direct pdfjs-dist imports after the Vercel
// Node runtime cascaded through three failures: DOMMatrix not defined,
// then worker-src empty rejection, then chunked-bundle module
// resolution for pdf.worker.mjs. unpdf's API is a strict subset of
// pdfjs's that suits text extraction without the runtime gymnastics.
//
// For PDF → DOCX we render extracted per-page text into HTML
// paragraphs then run html-to-docx to produce the final .docx binary
// (unchanged from the previous implementation).

// Polyfill kept for defense-in-depth — other libraries on this server
// path (e.g. html-to-docx, sharp) might independently reach for
// DOMMatrix; the no-op-when-already-defined polyfill is cheap insurance.
import '../polyfills/dom-matrix'

import type { Converter } from './types'
import { thrownToFailure } from './types'

async function extractPdfPagesAsText(buffer: Buffer): Promise<{
  pages: string[]
  warnings: string[]
  pageCount: number
}> {
  const { extractText, getDocumentProxy } = await import('unpdf')
  const data = new Uint8Array(buffer)
  const pdf = await getDocumentProxy(data)
  const result = await extractText(pdf, { mergePages: false })
  const pageCount = result.totalPages
  const rawPages = Array.isArray(result.text) ? result.text : [result.text]

  const pages: string[] = []
  const warnings: string[] = []
  for (let i = 0; i < rawPages.length; i++) {
    const pageText = (rawPages[i] ?? '').trim()
    const pageNum = i + 1
    if (pageText.length === 0) {
      warnings.push(`Page ${pageNum}: image-only content — no extractable text. Re-OCR with the OCR utility to capture image content.`)
      pages.push(`[Page ${pageNum}: image-only content]`)
    } else {
      pages.push(pageText)
    }
  }
  return { pages, warnings, pageCount }
}

export const pdfToText: Converter = async (input, _options) => {
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

export const pdfToDocx: Converter = async (input, _options) => {
  try {
    const { pages, warnings, pageCount } = await extractPdfPagesAsText(input)
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
