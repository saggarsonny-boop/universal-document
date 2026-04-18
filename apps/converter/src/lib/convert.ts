import { v4 as uuidv4 } from 'uuid'

export interface UDBlock {
  id: string
  type: 'paragraph' | 'heading' | 'list' | 'divider'
  base_content: Record<string, unknown>
  provenance?: { source: string; imported_from: string; imported_at: string }
}

export interface UDDocument {
  ud_version: string
  state: 'UDR'
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
}): UDDocument {
  const now = new Date().toISOString()
  return {
    ud_version: '0.1.0',
    state: 'UDR',
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
  }
}

export async function convertDocx(buffer: Buffer, fileName: string): Promise<UDDocument> {
  const mammoth = await import('mammoth')
  const result = await mammoth.convertToHtml({ buffer })
  const blocks = htmlToBlocks(result.value, fileName)
  const title = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  return buildUDDocument({ title, blocks, documentType: 'document', sourceFileName: fileName })
}

export async function convertTxt(text: string, fileName: string): Promise<UDDocument> {
  const blocks = textToBlocks(text, fileName)
  const title = fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
  return buildUDDocument({ title, blocks, documentType: 'document', sourceFileName: fileName })
}
