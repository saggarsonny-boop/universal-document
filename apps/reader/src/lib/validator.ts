import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import type { UDDocument } from './types'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  required: ['ud_version', 'state', 'metadata', 'manifest', 'blocks'],
  additionalProperties: false,
  properties: {
    ud_version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+(\\.\\d+)?$',
    },
    state: {
      type: 'string',
      enum: ['UDR', 'UDS'],
    },
    metadata: {
      type: 'object',
      required: ['id', 'title', 'created_at', 'updated_at', 'created_by', 'revoked'],
      additionalProperties: false,
      properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string', minLength: 1 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        created_by: { type: 'string', minLength: 1 },
        organisation: { type: 'string' },
        document_type: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        expiry: { type: 'string', format: 'date-time' },
        revoked: { type: 'boolean' },
        revocation_url: { type: 'string', format: 'uri' },
      },
    },
    manifest: {
      type: 'object',
      required: ['base_language', 'language_manifest', 'clarity_layer_manifest', 'permissions'],
      additionalProperties: false,
      properties: {
        base_language: { type: 'string' },
        language_manifest: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['code', 'label'],
            additionalProperties: false,
            properties: {
              code: { type: 'string' },
              label: { type: 'string' },
              direction: { type: 'string', enum: ['ltr', 'rtl'] },
            },
          },
        },
        clarity_layer_manifest: {
          type: 'array',
          items: {
            type: 'object',
            required: ['id', 'label'],
            additionalProperties: false,
            properties: {
              id: { type: 'string', pattern: '^[a-z0-9_-]+$' },
              label: { type: 'string' },
            },
          },
        },
        permissions: {
          type: 'object',
          additionalProperties: false,
          properties: {
            allow_copy: { type: 'boolean' },
            allow_print: { type: 'boolean' },
            allow_export: { type: 'boolean' },
            require_auth: { type: 'boolean' },
            audience: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
    blocks: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type', 'base_content'],
        additionalProperties: false,
        properties: {
          id: { type: 'string', minLength: 1 },
          type: {
            type: 'string',
            enum: ['paragraph', 'heading', 'table', 'list', 'image', 'code', 'divider', 'custom'],
          },
          base_content: { type: 'object' },
          clarity: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              additionalProperties: { type: 'string' },
            },
          },
          translations: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
          hidden: { type: 'boolean' },
          audience: { type: 'array', items: { type: 'string' } },
          provenance: {
            type: 'object',
            additionalProperties: false,
            properties: {
              source: { type: 'string' },
              imported_from: { type: 'string' },
              imported_at: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    seal: {
      type: 'object',
      required: ['sealed_at', 'sealed_by', 'hash', 'chain_of_custody'],
      additionalProperties: false,
      properties: {
        sealed_at: { type: 'string', format: 'date-time' },
        sealed_by: { type: 'string' },
        hash: { type: 'string', pattern: '^[a-f0-9]{64}$' },
        signature: { type: 'string' },
        verification_url: { type: 'string', format: 'uri' },
        blockchain: { type: ['string', 'null'] },
        chain_of_custody: {
          type: 'array',
          minItems: 1,
          items: {
            type: 'object',
            required: ['event', 'actor', 'timestamp'],
            additionalProperties: false,
            properties: {
              event: {
                type: 'string',
                enum: ['created', 'edited', 'reviewed', 'approved', 'sealed', 'shared', 'revoked'],
              },
              actor: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              note: { type: 'string' },
            },
          },
        },
      },
    },
  },
  if: { properties: { state: { const: 'UDS' } } },
  then: { required: ['seal'] },
  else: { properties: { seal: { not: {} } } },
}

const validate = ajv.compile(schema)

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateUDDocument(data: unknown): ValidationResult {
  const valid = validate(data)
  if (valid) {
    return { valid: true, errors: [] }
  }
  const errors = (validate.errors || []).map((e) => {
    return `${e.instancePath || '(root)'}: ${e.message}`
  })
  return { valid: false, errors }
}

export function checkExpiry(doc: UDDocument): boolean {
  if (!doc.metadata.expiry) return false
  return new Date() > new Date(doc.metadata.expiry)
}

export function checkRevoked(doc: UDDocument): boolean {
  return doc.metadata.revoked === true
}

export function resolveRendering(
  block: UDDocument['blocks'][0],
  activeLayer: string,
  activeLanguage: string
): string {
  const content = block.base_content as Record<string, unknown>

  // Fallback chain
  // 1. clarity[activeLayer][activeLanguage]
  if (block.clarity?.[activeLayer]?.[activeLanguage]) {
    return block.clarity[activeLayer][activeLanguage]
  }
  // 2. clarity["default"][activeLanguage]
  if (block.clarity?.['default']?.[activeLanguage]) {
    return block.clarity['default'][activeLanguage]
  }
  // 3. translations[activeLanguage]
  if (block.translations?.[activeLanguage]) {
    return block.translations[activeLanguage]
  }
  // 4. base_content text
  if (typeof content.text === 'string') {
    return content.text
  }
  return ''
}
