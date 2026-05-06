// CSV ↔ JSON converters using papaparse.
//
// CSV → JSON returns a UTF-8-encoded JSON array of objects (header row as
// keys). JSON → CSV serialises an array of objects (or a single object
// flattened to one row) into RFC 4180-style CSV.

import type { Converter, ConverterResult } from './types'
import { thrownToFailure } from './types'

export const csvToJson: Converter = async (input, options) => {
  try {
    const Papa = (await import('papaparse')).default
    const csvText = input.toString('utf-8')
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
    if (parsed.errors.length > 0) {
      const first = parsed.errors[0]
      return {
        ok: false,
        error: {
          code: 'invalid_input',
          message: `CSV parse error: ${first.message}`,
          recoverable: true,
          detail: `Row ${first.row}: ${first.code}`,
        },
      }
    }
    const json = JSON.stringify(parsed.data, null, 2)
    return {
      ok: true,
      buffer: Buffer.from(json, 'utf-8'),
      contentType: 'application/json',
      warnings: parsed.errors.length > 0 ? [`${parsed.errors.length} parse warnings ignored.`] : undefined,
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const jsonToCsv: Converter = async (input, options) => {
  try {
    const Papa = (await import('papaparse')).default
    const text = input.toString('utf-8')
    const parsed = JSON.parse(text)
    // Accept array of objects, or single object → one-row CSV
    const rows = Array.isArray(parsed) ? parsed : [parsed]
    if (rows.length === 0) {
      return {
        ok: true,
        buffer: Buffer.from('', 'utf-8'),
        contentType: 'text/csv',
        warnings: ['Input JSON had no rows; output CSV is empty.'],
      }
    }
    const csv = Papa.unparse(rows as Record<string, unknown>[])
    return {
      ok: true,
      buffer: Buffer.from(csv, 'utf-8'),
      contentType: 'text/csv',
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return {
        ok: false,
        error: {
          code: 'invalid_input',
          message: `Input is not valid JSON: ${err.message}`,
          recoverable: true,
        },
      }
    }
    return thrownToFailure(err)
  }
}
