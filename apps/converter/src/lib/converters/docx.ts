// DOCX → HTML / Markdown / Plain text via mammoth + turndown.
//
// DOCX → DOCX path is the identity (no-op). DOCX → other formats first
// extracts to HTML via mammoth, then transforms HTML → target.

import type { Converter } from './types'
import { thrownToFailure } from './types'

export const docxToHtml: Converter = async (input, options) => {
  try {
    const mammoth = (await import('mammoth')).default
    const { value, messages } = await mammoth.convertToHtml({ buffer: input })
    return {
      ok: true,
      buffer: Buffer.from(value, 'utf-8'),
      contentType: 'text/html',
      warnings: messages.length > 0 ? messages.map(m => `${m.type}: ${m.message}`) : undefined,
    }
  } catch (err) {
    return thrownToFailure(err, { code: 'invalid_input', recoverable: true })
  }
}

export const docxToMd: Converter = async (input, options) => {
  try {
    const mammoth = (await import('mammoth')).default
    const TurndownService = (await import('turndown')).default
    const { value: html, messages } = await mammoth.convertToHtml({ buffer: input })
    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    })
    const md = td.turndown(html)
    return {
      ok: true,
      buffer: Buffer.from(md, 'utf-8'),
      contentType: 'text/markdown',
      warnings: messages.length > 0 ? messages.map(m => `${m.type}: ${m.message}`) : undefined,
    }
  } catch (err) {
    return thrownToFailure(err, { code: 'invalid_input', recoverable: true })
  }
}

export const docxToTxt: Converter = async (input, options) => {
  try {
    const mammoth = (await import('mammoth')).default
    const { value, messages } = await mammoth.extractRawText({ buffer: input })
    return {
      ok: true,
      buffer: Buffer.from(value, 'utf-8'),
      contentType: 'text/plain',
      warnings: messages.length > 0 ? messages.map(m => `${m.type}: ${m.message}`) : undefined,
    }
  } catch (err) {
    return thrownToFailure(err, { code: 'invalid_input', recoverable: true })
  }
}
