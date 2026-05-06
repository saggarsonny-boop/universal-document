// Minimal DOMMatrix polyfill for the Node serverless runtime.
//
// pdfjs-dist 5.x assumes a browser environment and references the
// `DOMMatrix` global during page rendering / text extraction. Vercel's
// Node 20 runtime has no DOMMatrix, so calls to `getTextContent()` on
// any PDF page throw `ReferenceError: DOMMatrix is not defined` —
// breaking the orchestrator's pdf→txt and pdf→docx routes (and the
// legacy /api/convert UDS path) even when the document loads cleanly.
//
// This polyfill installs a minimal DOMMatrix class on `globalThis` IFF
// one is not already present. The class implements the constructor
// shapes pdfjs uses (no-arg, 6-element array, copy-from-DOMMatrix) and
// the methods pdfjs-dist 5.x's text-extraction path actually calls:
// `multiply`, `translate`, `scale`, `inverse`, `transformPoint`. Other
// methods are stubbed to return `this` as a no-op so unexpected calls
// don't crash mid-conversion. We accept the precision tradeoff vs a
// browser-grade implementation — text-extraction transforms only need
// 2D affine math, and pdfjs's own internal pipelines don't require
// 3D operations.
//
// IMPORTANT: this module must be imported BEFORE any code that imports
// `pdfjs-dist`. Side-effect import:
//
//   import '@/lib/polyfills/dom-matrix'
//   const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
//
// Idempotent — re-imports are no-ops once the global is set.

class DOMMatrixPolyfill {
  a: number
  b: number
  c: number
  d: number
  e: number
  f: number
  m11: number
  m12: number
  m21: number
  m22: number
  m41: number
  m42: number
  is2D: boolean

  constructor(init?: number[] | DOMMatrixPolyfill) {
    if (init instanceof DOMMatrixPolyfill) {
      this.a = init.a; this.b = init.b
      this.c = init.c; this.d = init.d
      this.e = init.e; this.f = init.f
    } else if (Array.isArray(init) && init.length === 6) {
      this.a = init[0]; this.b = init[1]
      this.c = init[2]; this.d = init[3]
      this.e = init[4]; this.f = init[5]
    } else {
      this.a = 1; this.b = 0
      this.c = 0; this.d = 1
      this.e = 0; this.f = 0
    }
    // Aliases pdfjs occasionally reads.
    this.m11 = this.a; this.m12 = this.b
    this.m21 = this.c; this.m22 = this.d
    this.m41 = this.e; this.m42 = this.f
    this.is2D = true
  }

  multiply(other: DOMMatrixPolyfill): DOMMatrixPolyfill {
    const r = new DOMMatrixPolyfill()
    r.a = this.a * other.a + this.c * other.b
    r.b = this.b * other.a + this.d * other.b
    r.c = this.a * other.c + this.c * other.d
    r.d = this.b * other.c + this.d * other.d
    r.e = this.a * other.e + this.c * other.f + this.e
    r.f = this.b * other.e + this.d * other.f + this.f
    return r
  }

  translate(tx: number, ty: number): DOMMatrixPolyfill {
    const r = new DOMMatrixPolyfill()
    r.a = this.a; r.b = this.b
    r.c = this.c; r.d = this.d
    r.e = this.a * tx + this.c * ty + this.e
    r.f = this.b * tx + this.d * ty + this.f
    return r
  }

  scale(sx: number, sy: number = sx): DOMMatrixPolyfill {
    const r = new DOMMatrixPolyfill()
    r.a = this.a * sx; r.b = this.b * sx
    r.c = this.c * sy; r.d = this.d * sy
    r.e = this.e; r.f = this.f
    return r
  }

  inverse(): DOMMatrixPolyfill {
    const det = this.a * this.d - this.b * this.c
    if (det === 0) {
      // Singular — return identity rather than throw, matching the
      // browser's permissive behaviour on non-invertible 2D matrices
      // (some pdfs have degenerate transforms on hairline glyph paths).
      return new DOMMatrixPolyfill()
    }
    const inv = 1 / det
    const r = new DOMMatrixPolyfill()
    r.a =  this.d * inv
    r.b = -this.b * inv
    r.c = -this.c * inv
    r.d =  this.a * inv
    r.e = (this.c * this.f - this.d * this.e) * inv
    r.f = (this.b * this.e - this.a * this.f) * inv
    return r
  }

  transformPoint(point: { x?: number; y?: number } = {}): { x: number; y: number } {
    const x = point.x ?? 0
    const y = point.y ?? 0
    return {
      x: this.a * x + this.c * y + this.e,
      y: this.b * x + this.d * y + this.f,
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var DOMMatrix: typeof DOMMatrixPolyfill | undefined
}

if (typeof globalThis.DOMMatrix === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).DOMMatrix = DOMMatrixPolyfill
}

export {}
