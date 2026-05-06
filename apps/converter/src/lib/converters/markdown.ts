// Markdown ↔ HTML via marked, HTML → MD via turndown.

import type { Converter } from './types'
import { thrownToFailure } from './types'

export const mdToHtml: Converter = async (input, options) => {
  try {
    const { marked } = await import('marked')
    const md = input.toString('utf-8')
    const html = await marked.parse(md)
    return {
      ok: true,
      buffer: Buffer.from(html, 'utf-8'),
      contentType: 'text/html',
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const htmlToMd: Converter = async (input, options) => {
  try {
    const TurndownService = (await import('turndown')).default
    const td = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    })
    const html = input.toString('utf-8')
    const md = td.turndown(html)
    return {
      ok: true,
      buffer: Buffer.from(md, 'utf-8'),
      contentType: 'text/markdown',
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const mdToTxt: Converter = async (input, options) => {
  try {
    // md → html → strip tags → text. Keeps paragraph breaks via two newlines.
    const { marked } = await import('marked')
    const md = input.toString('utf-8')
    const html = await marked.parse(md)
    const text = html
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/(h[1-6])>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    return {
      ok: true,
      buffer: Buffer.from(text, 'utf-8'),
      contentType: 'text/plain',
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}
