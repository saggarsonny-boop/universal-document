export type UDState = 'UDR' | 'UDS'

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'table'
  | 'list'
  | 'image'
  | 'code'
  | 'divider'
  | 'custom'

export interface LanguageEntry {
  code: string
  label: string
  direction?: 'ltr' | 'rtl'
}

export interface ClarityLayerEntry {
  id: string
  label: string
}

export interface Permissions {
  allow_copy?: boolean
  allow_print?: boolean
  allow_export?: boolean
  require_auth?: boolean
  audience?: string[]
}

export interface Manifest {
  base_language: string
  language_manifest: LanguageEntry[]
  clarity_layer_manifest: ClarityLayerEntry[]
  permissions: Permissions
}

export interface Metadata {
  id: string
  title: string
  created_at: string
  updated_at: string
  created_by: string
  organisation?: string
  document_type?: string
  tags?: string[]
  expiry?: string
  revoked: boolean
  revocation_url?: string
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

export interface Provenance {
  source?: string
  imported_from?: string
  imported_at?: string
}

export interface ContentBlock {
  id: string
  type: BlockType
  base_content: Record<string, unknown>
  clarity?: Record<string, Record<string, string>>
  translations?: Record<string, string>
  hidden?: boolean
  audience?: string[]
  provenance?: Provenance
}

export interface ChainOfCustodyEntry {
  event: 'created' | 'edited' | 'reviewed' | 'approved' | 'sealed' | 'shared' | 'revoked'
  actor: string
  timestamp: string
  note?: string
}

export interface Seal {
  sealed_at: string
  sealed_by: string
  hash: string
  verification_url?: string
  signature?: string
  chain_of_custody: ChainOfCustodyEntry[]
}

export interface UDDocument {
  ud_version: string
  state: UDState
  metadata: Metadata
  manifest: Manifest
  blocks: ContentBlock[]
  seal?: Seal
}
