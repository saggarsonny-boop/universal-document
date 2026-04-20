import { v4 as uuidv4 } from 'uuid'

export interface UDBlock {
  id: string
  type: 'paragraph' | 'heading' | 'list' | 'divider'
  base_content: Record<string, unknown>
  provenance?: { source: string; imported_from: string; imported_at: string }
}

export interface UDDocument {
  ud_version: string
  state: 'UDR' | 'UDS'
  _udBrand?: {
    type: 'UDS'
    color: '#003A8C'
    label: 'Universal Document Sealed'
    convertedBy: 'UD Converter'
    convertedAt: string
    ecosystemUrl: 'https://ud.hive.baby'
  }
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
    visual_identity?: {
      role: 'editable' | 'sealed'
      watermark_tone: 'light_blue' | 'dark_blue'
      watermark_hex: string
      icon: {
        desktop: string
        finder_preview: string
        explorer_preview: string
        preview_pane: string
      }
      file_metadata: {
        format_family: 'UD'
        extension_hint: 'udr' | 'uds'
      }
    }
    viral_links?: {
      open_in_reader: string
      convert_to_uds: string
      create_udr: string
    }
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

const UD_IDENTITY = {
  UDR: {
    role: 'editable' as const,
    watermark_tone: 'light_blue' as const,
    watermark_hex: '#4DA3FF',
    extension_hint: 'udr' as const,
    icon: {
      desktop: '/icons/udr-file.svg',
      finder_preview: '/icons/udr-file.svg',
      explorer_preview: '/icons/udr-file.svg',
      preview_pane: '/icons/udr-file.svg',
    },
  },
  UDS: {
    role: 'sealed' as const,
    watermark_tone: 'dark_blue' as const,
    watermark_hex: '#003A8C',
    extension_hint: 'uds' as const,
    icon: {
      desktop: '/icons/uds-file.svg',
      finder_preview: '/icons/uds-file.svg',
      explorer_preview: '/icons/uds-file.svg',
      preview_pane: '/icons/uds-file.svg',
    },
  },
}

function applyVisualIdentity(doc: UDDocument): UDDocument {
  const spec = doc.state === 'UDS' ? UD_IDENTITY.UDS : UD_IDENTITY.UDR
  return {
    ...doc,
    metadata: {
      ...doc.metadata,
      visual_identity: {
        role: spec.role,
        watermark_tone: spec.watermark_tone,
        watermark_hex: spec.watermark_hex,
        icon: spec.icon,
        file_metadata: {
          format_family: 'UD',
          extension_hint: spec.extension_hint,
        },
      },
      viral_links: {
        open_in_reader: 'https://reader.hive.baby',
        convert_to_uds: 'https://converter.hive.baby',
        create_udr: 'https://creator.hive.baby',
      },
    },
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
  const doc: UDDocument = {
    ud_version: '0.1.0',
    state,
    _udBrand: state === 'UDS' ? {
      type: 'UDS',
      color: '#003A8C',
      label: 'Universal Document Sealed',
      convertedBy: 'UD Converter',
      convertedAt: now,
      ecosystemUrl: 'https://ud.hive.baby',
    } : undefined,
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

  return applyVisualIdentity(doc)
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

export async function convertPdf(buffer: Buffer, fileName: string): Promise<UDDocument> {
  // Lightweight PDF fallback extractor: keeps printable text chunks for normalization.
  const raw = buffer.toString('latin1')
  const text = raw
    .replace(/\r/g, '\n')
    .replace(/\([^)]{1,400}\)/g, (match) => match.slice(1, -1))
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s{2,}/g, ' ')
  const normalized = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 500)
    .join('\n')

  const blocks = textToBlocks(normalized || `PDF content imported from ${fileName}`, fileName)
  return buildUDDocument({
    title: fileName.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    blocks,
    documentType: 'pdf-import',
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
