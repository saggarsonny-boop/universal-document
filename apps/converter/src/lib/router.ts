// UD Converter v2 — format detection + route selection.
//
// Pure functions, no I/O, no side effects. The orchestrator (orchestrator.ts)
// calls detectFormat + chooseRoute to decide which conversion path to run.
// Actual conversion implementations live in lib/converters/* and lib/llm/*.
//
// PR A scope: the router decides where work would go but the orchestrator
// only USES the decisions for telemetry until PR B wires up the new
// pure-lib / tesseract paths. Existing PDF → UDS path is left untouched
// (PR #2's per-page graceful degradation stays in convert.ts and is
// reached via the `existing-uds-pipeline` route).

// ─── Format taxonomy ───────────────────────────────────────────────────────

export type InputFormat =
  | 'pdf'
  | 'docx'
  | 'odt'
  | 'xlsx'
  | 'csv'
  | 'tsv'
  | 'json'
  | 'xml'
  | 'html'
  | 'md'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'svg'
  | 'audio'  // mp3 / wav / m4a / ogg — not supported in v1
  | 'video'  // mp4 / mov / webm — not supported in v1
  | 'unknown'

export type OutputFormat =
  | 'uds'   // canonical Hive output — handled by existing pipeline
  | 'pdf'
  | 'docx'
  | 'xlsx'
  | 'csv'
  | 'json'
  | 'xml'
  | 'html'
  | 'md'
  | 'txt'
  | 'png'
  | 'jpg'
  | 'webp'

export type Route =
  | 'pure-lib'              // zero-cost JS library, no external API call
  | 'tesseract'             // tesseract.js WASM OCR (free but slow)
  | 'groq-llama'            // Groq Llama 3.1 8B Instant — cheap LLM, free tier first
  | 'anthropic-haiku'       // Claude Haiku 4.5 — last-resort, expensive
  | 'existing-uds-pipeline' // PR #2's pdf→UDS path — preserved as-is
  | 'unsupported'           // returned for audio/video and unimplemented combos

/**
 * Hint about how hard the input is. The orchestrator may upgrade `simple`
 * → `complex` after a first-attempt parse returns sparse/garbled text. Pure
 * extension/mime detection cannot tell ahead of time whether a PDF has
 * rotated pages or is a scan of a signature, so this hint exists for the
 * second-attempt route selection.
 */
export type Complexity = 'simple' | 'complex'

// ─── Magic-byte signatures ─────────────────────────────────────────────────
// First few bytes (hex) of common file formats. Used as a tiebreaker when
// the extension and MIME disagree (or when neither is provided). Source:
// https://en.wikipedia.org/wiki/List_of_file_signatures.
const MAGIC_BYTES: Array<{ format: InputFormat; signature: number[] }> = [
  { format: 'pdf',  signature: [0x25, 0x50, 0x44, 0x46] },               // %PDF
  { format: 'png',  signature: [0x89, 0x50, 0x4E, 0x47] },               // .PNG
  { format: 'jpg',  signature: [0xFF, 0xD8, 0xFF] },                     // JPEG SOI
  { format: 'gif',  signature: [0x47, 0x49, 0x46, 0x38] },               // GIF8
  { format: 'webp', signature: [0x52, 0x49, 0x46, 0x46] },               // RIFF — also WAV/AVI; refined below
  { format: 'docx', signature: [0x50, 0x4B, 0x03, 0x04] },               // ZIP — also xlsx/odt; refined by extension/mime
  { format: 'xlsx', signature: [0x50, 0x4B, 0x03, 0x04] },               // same — refined by extension
]

function magicBytesMatch(bytes: Uint8Array | undefined, sig: number[]): boolean {
  if (!bytes || bytes.length < sig.length) return false
  for (let i = 0; i < sig.length; i++) {
    if (bytes[i] !== sig[i]) return false
  }
  return true
}

// MIME → InputFormat lookup. Conservative: only entries we explicitly support.
const MIME_TO_FORMAT: Record<string, InputFormat> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.oasis.opendocument.text': 'odt',
  'text/csv': 'csv',
  'text/tab-separated-values': 'tsv',
  'application/json': 'json',
  'application/xml': 'xml',
  'text/xml': 'xml',
  'text/html': 'html',
  'text/markdown': 'md',
  'text/plain': 'txt',
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'audio/mpeg': 'audio',
  'audio/wav': 'audio',
  'audio/m4a': 'audio',
  'audio/ogg': 'audio',
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/webm': 'video',
}

// Extension → InputFormat fallback when MIME is missing or generic.
const EXTENSION_TO_FORMAT: Record<string, InputFormat> = {
  pdf: 'pdf',
  docx: 'docx',
  odt: 'odt',
  xlsx: 'xlsx',
  csv: 'csv',
  tsv: 'tsv',
  json: 'json',
  xml: 'xml',
  html: 'html',
  htm: 'html',
  md: 'md',
  markdown: 'md',
  txt: 'txt',
  png: 'png',
  jpg: 'jpg',
  jpeg: 'jpeg',
  webp: 'webp',
  gif: 'gif',
  svg: 'svg',
  mp3: 'audio',
  wav: 'audio',
  m4a: 'audio',
  ogg: 'audio',
  mp4: 'video',
  mov: 'video',
  webm: 'video',
}

/**
 * Detect input format from a file descriptor. Tries (in order):
 *   1. MIME type, when explicit and recognised
 *   2. Magic bytes (the most reliable signal for formats we have signatures for)
 *   3. Extension, as a final fallback
 *
 * Returns 'unknown' only when all three fail. Magic-byte checks are
 * intentionally cheap — they only inspect the first 8 bytes — so this is
 * safe to call on every upload without buffering large files.
 */
export function detectFormat(file: {
  name?: string
  mimeType?: string
  bytes?: Uint8Array
}): InputFormat {
  // 1. MIME first (the upload's Content-Type / File.type field)
  if (file.mimeType) {
    const m = MIME_TO_FORMAT[file.mimeType.toLowerCase()]
    if (m) return m
  }

  // 2. Magic bytes — disambiguates ZIP-based formats only when extension
  //    and MIME both failed. We don't try to distinguish docx from xlsx on
  //    bytes alone (they're both ZIPs); the extension check below handles it.
  if (file.bytes) {
    for (const entry of MAGIC_BYTES) {
      // Skip docx/xlsx ambiguity at the byte level — both share the ZIP
      // signature; defer to extension/mime
      if (entry.format === 'docx' || entry.format === 'xlsx') continue
      if (magicBytesMatch(file.bytes, entry.signature)) return entry.format
    }
  }

  // 3. Extension
  if (file.name) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext && EXTENSION_TO_FORMAT[ext]) return EXTENSION_TO_FORMAT[ext]
  }

  return 'unknown'
}

// ─── Route selection ───────────────────────────────────────────────────────

// Pairs that always have a deterministic pure-library converter available.
// (These are the targets PR B will wire up; PR A only annotates them in
// telemetry.)
const PURE_LIB_PAIRS: Array<{ from: InputFormat; to: OutputFormat }> = [
  { from: 'csv',  to: 'json' },
  { from: 'csv',  to: 'xlsx' },
  { from: 'json', to: 'csv' },
  { from: 'json', to: 'xml' },
  { from: 'xml',  to: 'json' },
  { from: 'xlsx', to: 'csv' },
  { from: 'xlsx', to: 'json' },
  { from: 'docx', to: 'html' },
  { from: 'docx', to: 'md' },
  { from: 'docx', to: 'txt' },
  { from: 'html', to: 'md' },
  { from: 'html', to: 'txt' },
  { from: 'html', to: 'pdf' },   // requires headless chrome
  { from: 'md',   to: 'html' },
  { from: 'md',   to: 'pdf' },   // md → html → pdf chain
  { from: 'md',   to: 'docx' },
  { from: 'pdf',  to: 'txt' },   // pdfjs text extract
  // Image-to-image
  { from: 'png',  to: 'jpg' },
  { from: 'png',  to: 'webp' },
  { from: 'jpg',  to: 'png' },
  { from: 'jpg',  to: 'webp' },
  { from: 'webp', to: 'png' },
  { from: 'webp', to: 'jpg' },
  // Trivial pass-throughs
  { from: 'txt',  to: 'md' },
  { from: 'md',   to: 'txt' },
]

function isPureLibPair(input: InputFormat, output: OutputFormat): boolean {
  return PURE_LIB_PAIRS.some(p => p.from === input && p.to === output)
}

const IMAGE_FORMATS: InputFormat[] = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg']

/**
 * Select the conversion route for an (input → output) pair. The orchestrator
 * starts with `complexity: 'simple'` and may re-call with `'complex'` after
 * a first-attempt produced sparse/garbled output (the per-page degradation
 * pattern from PR #2 generalised across formats).
 *
 * Routing rules (in priority order):
 *   - audio / video / unknown → unsupported (return error to caller)
 *   - pdf → uds → existing-uds-pipeline  (PR #2's path, intentionally preserved)
 *   - image → text-like format → tesseract (OCR), then groq-llama if Tesseract
 *     returns < 100 chars (decided by orchestrator, not here)
 *   - pdf → text/docx/html/md (simple) → pure-lib (pdfjs path)
 *   - pdf → text/docx/html/md (complex) → groq-llama, escalate to anthropic
 *   - explicit pure-lib pair → pure-lib
 *   - everything else → groq-llama (cheap LLM extraction)
 */
export function chooseRoute(
  input: InputFormat,
  output: OutputFormat,
  complexity: Complexity = 'simple',
): Route {
  // Hard stops — these aren't supported in v1.
  if (input === 'audio' || input === 'video') return 'unsupported'
  if (input === 'unknown') return 'unsupported'

  // Preserve PR #2's existing PDF → UDS path. Untouched.
  if (input === 'pdf' && output === 'uds') return 'existing-uds-pipeline'

  // Image OCR — tesseract first; orchestrator escalates to groq-llama if
  // tesseract returns < 100 chars (rule lives in orchestrator, not router).
  const isImageInput = IMAGE_FORMATS.includes(input)
  const isTextOutput = output === 'txt' || output === 'md' || output === 'html' || output === 'docx'
  if (isImageInput && isTextOutput) {
    return 'tesseract'
  }

  // Image → image — sharp handles it as pure-lib.
  if (isImageInput && (output === 'png' || output === 'jpg' || output === 'webp')) {
    return 'pure-lib'
  }

  // Complex PDFs (rotated, multi-column, scan-mixed) — Groq is primary
  // because it's an order of magnitude cheaper than Anthropic. Orchestrator
  // escalates to anthropic-haiku on Groq failure or rate-limit.
  if (input === 'pdf' && complexity === 'complex') {
    return 'groq-llama'
  }

  // Pure-library pair — first-attempt path.
  if (isPureLibPair(input, output)) {
    return 'pure-lib'
  }

  // Everything else — cheap LLM. Orchestrator escalates on failure.
  return 'groq-llama'
}

/** All routes the orchestrator can be asked to handle. */
export const ALL_ROUTES: Route[] = [
  'pure-lib',
  'tesseract',
  'groq-llama',
  'anthropic-haiku',
  'existing-uds-pipeline',
  'unsupported',
]
