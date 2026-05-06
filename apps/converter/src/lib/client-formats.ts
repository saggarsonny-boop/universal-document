// Client-side format taxonomy + matrix.
//
// Mirrors the SERVER's router.ts InputFormat / OutputFormat / detectFormat,
// but trimmed to the v1 supported set (drops audio/video which surface as
// 'unsupported' anyway). The reason this is duplicated rather than
// imported: router.ts has server-only imports (none today, but planned)
// and we want the Format dropdowns to render in the client bundle without
// pulling server code.
//
// SUPPORTED_PAIRS catalogues every (input, output) the UI should ENABLE
// in the To dropdown. Pairs not listed render disabled with a "Coming
// soon" tooltip. The matrix MUST stay in sync with the server's router
// + converter registry — the failure mode if it drifts is "user clicks
// Convert and gets a not-implemented error".

export type ClientInputFormat =
  | 'pdf' | 'docx' | 'odt' | 'xlsx'
  | 'csv' | 'tsv'
  | 'json' | 'xml' | 'yaml'
  | 'html' | 'md' | 'txt'
  | 'png' | 'jpg' | 'webp' | 'gif' | 'svg'
  | 'unknown'

export type ClientOutputFormat =
  | 'uds'
  | 'pdf' | 'docx' | 'xlsx'
  | 'csv' | 'json' | 'xml'
  | 'html' | 'md' | 'txt'
  | 'png' | 'jpg' | 'webp'

// Friendly label + alphabetical sort priority. PDF (input default) and
// UDS (output default) get priority 0 so they sit at the top of their
// respective dropdowns; everything else is alphabetical (priority 1).
export type FormatMeta = {
  code: ClientInputFormat | ClientOutputFormat
  label: string
  /** 0 = pinned to top (default), 1 = alphabetical. */
  priority: 0 | 1
}

export const INPUT_FORMATS: FormatMeta[] = [
  { code: 'pdf',  label: 'PDF',  priority: 0 },  // default
  { code: 'csv',  label: 'CSV',  priority: 1 },
  { code: 'docx', label: 'DOCX', priority: 1 },
  { code: 'gif',  label: 'GIF',  priority: 1 },
  { code: 'html', label: 'HTML', priority: 1 },
  { code: 'jpg',  label: 'JPG',  priority: 1 },
  { code: 'json', label: 'JSON', priority: 1 },
  { code: 'md',   label: 'MD',   priority: 1 },
  { code: 'odt',  label: 'ODT',  priority: 1 },
  { code: 'png',  label: 'PNG',  priority: 1 },
  { code: 'svg',  label: 'SVG',  priority: 1 },
  { code: 'tsv',  label: 'TSV',  priority: 1 },
  { code: 'txt',  label: 'TXT',  priority: 1 },
  { code: 'webp', label: 'WEBP', priority: 1 },
  { code: 'xlsx', label: 'XLSX', priority: 1 },
  { code: 'xml',  label: 'XML',  priority: 1 },
  { code: 'yaml', label: 'YAML', priority: 1 },
]

export const OUTPUT_FORMATS: FormatMeta[] = [
  { code: 'uds',  label: 'UDS',  priority: 0 },  // default
  { code: 'csv',  label: 'CSV',  priority: 1 },
  { code: 'docx', label: 'DOCX', priority: 1 },
  { code: 'html', label: 'HTML', priority: 1 },
  { code: 'jpg',  label: 'JPG',  priority: 1 },
  { code: 'json', label: 'JSON', priority: 1 },
  { code: 'md',   label: 'MD',   priority: 1 },
  { code: 'pdf',  label: 'PDF',  priority: 1 },
  { code: 'png',  label: 'PNG',  priority: 1 },
  { code: 'txt',  label: 'TXT',  priority: 1 },
  { code: 'webp', label: 'WEBP', priority: 1 },
  { code: 'xlsx', label: 'XLSX', priority: 1 },
  { code: 'xml',  label: 'XML',  priority: 1 },
]

// Every (input, output) pair the UI should enable. Mirrors the server's
// router.PURE_LIB_PAIRS + converter registry + the legacy /api/convert
// UDS path (which accepts pdf/docx/xlsx/csv/html/png/jpg/webp/gif/txt/md
// as input).
//
// Unsupported pairs render disabled with a "Coming soon" tooltip; the
// user can still see they exist but can't pick them. PR D may widen this
// matrix as more converters land (notably html→pdf which needs
// @sparticuz/chromium-min, and pdf-rasterise→txt which needs canvas).
const PAIRS: Array<[ClientInputFormat, ClientOutputFormat]> = [
  // Universal: any supported input → UDS via legacy /api/convert
  ['pdf',  'uds'], ['docx', 'uds'], ['xlsx', 'uds'], ['csv',  'uds'],
  ['html', 'uds'], ['md',   'uds'], ['txt',  'uds'],
  ['png',  'uds'], ['jpg',  'uds'], ['webp', 'uds'], ['gif',  'uds'],

  // CSV / JSON / XLSX matrix
  ['csv',  'json'], ['csv',  'xlsx'],
  ['json', 'csv'],  ['json', 'xml'],  ['json', 'xlsx'],
  ['xlsx', 'csv'],  ['xlsx', 'json'],

  // XML
  ['xml',  'json'],

  // Markdown / HTML / TXT
  ['md',   'html'], ['md',   'txt'],
  ['html', 'md'],
  ['docx', 'html'], ['docx', 'md'], ['docx', 'txt'],

  // PDF (one-way out — pdf in any format needs OCR for full coverage)
  ['pdf',  'txt'], ['pdf',  'docx'],

  // Image ↔ image
  ['png',  'jpg'], ['png',  'webp'],
  ['jpg',  'png'], ['jpg',  'webp'],
  ['webp', 'png'], ['webp', 'jpg'],
  ['gif',  'png'], ['gif',  'jpg'],

  // Image OCR via tesseract
  ['png',  'txt'], ['jpg',  'txt'], ['webp', 'txt'],
]

const PAIR_SET = new Set(PAIRS.map(([f, t]) => `${f}->${t}`))

/** Is this exact (input, output) pair enabled in the v1 UI? */
export function isPairSupported(input: ClientInputFormat, output: ClientOutputFormat): boolean {
  return PAIR_SET.has(`${input}->${output}`)
}

/** Which OutputFormats are enabled given a chosen InputFormat? */
export function compatibleOutputs(input: ClientInputFormat): Set<ClientOutputFormat> {
  const out = new Set<ClientOutputFormat>()
  for (const [f, t] of PAIRS) {
    if (f === input) out.add(t)
  }
  return out
}

// Inputs that have at least one supported output. PR #11 hid unsupported
// pairs from the To dropdown; this complements that by hiding inputs which
// have zero outputs at all (`odt`, `tsv`, `yaml`, `svg` are advertised in
// INPUT_FORMATS as future-ready labels but no PAIR has them as the source
// side, so picking them used to leave the To dropdown showing only the
// UDS-only safety fallback).
const SUPPORTED_INPUTS_SET: Set<ClientInputFormat> = new Set(PAIRS.map(([f]) => f))

/** Is this input format the source side of at least one supported pair? */
export function isInputSupported(input: ClientInputFormat): boolean {
  return SUPPORTED_INPUTS_SET.has(input)
}

// Browser-side format detection from File. Mirrors router.ts's MIME +
// extension fallback chain (without magic-byte inspection — clients have
// File.type from the browser which is generally reliable).
const MIME_TO_FORMAT: Record<string, ClientInputFormat> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.oasis.opendocument.text': 'odt',
  'text/csv': 'csv',
  'text/tab-separated-values': 'tsv',
  'application/json': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'application/x-yaml': 'yaml',
  'text/yaml': 'yaml',
  'text/html': 'html',
  'text/markdown': 'md',
  'text/plain': 'txt',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
}

const EXT_TO_FORMAT: Record<string, ClientInputFormat> = {
  pdf: 'pdf', docx: 'docx', odt: 'odt', xlsx: 'xlsx',
  csv: 'csv', tsv: 'tsv',
  json: 'json', xml: 'xml', yaml: 'yaml', yml: 'yaml',
  html: 'html', htm: 'html', md: 'md', markdown: 'md', txt: 'txt',
  png: 'png', jpg: 'jpg', jpeg: 'jpg', webp: 'webp', gif: 'gif', svg: 'svg',
}

export function detectClientFormat(file: File): ClientInputFormat {
  if (file.type) {
    const m = MIME_TO_FORMAT[file.type.toLowerCase()]
    if (m) return m
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext && EXT_TO_FORMAT[ext]) return EXT_TO_FORMAT[ext]
  return 'unknown'
}
