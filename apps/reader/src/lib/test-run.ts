import { validateUDDocument } from './validator'

const mockDoc = {
  ud_version: '1.0.0',
  state: 'UDR',
  metadata: {
    id: 'd9b00000-0000-0000-0000-000000000001',
    title: 'Branded Test Document',
    created_at: '2026-05-20T12:00:00Z',
    updated_at: '2026-05-20T12:00:00Z',
    created_by: 'Attorney Sonny',
    revoked: false,
    visual_identity: {
      role: 'sealed',
      watermark_hex: '#c8960a',
      watermark_tone: 'standard',
      file_metadata: {
        format_family: 'UD',
        extension_hint: 'uds'
      },
      icon: {
        desktop: 'icon-1',
        finder_preview: 'preview-1',
        explorer_preview: 'preview-2',
        preview_pane: 'pane-1'
      }
    },
    viral_links: {
      open_in_reader: 'https://reader.network.baby/open',
      convert_to_uds: 'https://converter.network.baby/convert',
      create_udr: 'https://creator.network.baby/create'
    }
  },
  manifest: {
    base_language: 'en',
    language_manifest: [
      { code: 'en', label: 'English', direction: 'ltr' }
    ],
    clarity_layer_manifest: [
      { id: 'default', label: 'Default' }
    ],
    permissions: {
      allow_copy: true,
      allow_print: true,
      allow_export: true
    }
  },
  blocks: [
    {
      id: 'b1',
      type: 'paragraph',
      base_content: { text: 'Hello, World!' }
    }
  ]
}

const result = validateUDDocument(mockDoc)
console.log('----------------------------------------------------')
console.log('PROGRAMMATIC VALIDATION TEST RUN')
console.log('Result valid:', result.valid)
console.log('Errors:', result.errors)
console.log('----------------------------------------------------')

if (result.valid) {
  console.log('SUCCESS: Branded UD Document validation passed successfully!')
  process.exit(0)
} else {
  console.error('FAILURE: Validation failed with errors:', result.errors)
  process.exit(1)
}
