// XLSX ↔ CSV / JSON converters using the xlsx (SheetJS) library.
//
// On the way IN to xlsx: parse a workbook from buffer.
// On the way OUT to xlsx: build a workbook with one sheet and write to
// XLSX binary format (Buffer of 'xlsx' type bytes).

import type { Converter } from './types'
import { thrownToFailure } from './types'

async function parseWorkbook(buffer: Buffer) {
  const XLSX = await import('xlsx')
  return XLSX.read(buffer, { type: 'buffer' })
}

async function workbookFromRows(rows: Array<Record<string, unknown>>, sheetName = 'Sheet1') {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  // .write returns Buffer when type='buffer' is requested.
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

export const xlsxToCsv: Converter = async (input, options) => {
  try {
    const XLSX = await import('xlsx')
    const wb = await parseWorkbook(input)
    const firstSheetName = wb.SheetNames[0]
    if (!firstSheetName) {
      return {
        ok: false,
        error: { code: 'invalid_input', message: 'XLSX has no sheets.', recoverable: true },
      }
    }
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[firstSheetName])
    return {
      ok: true,
      buffer: Buffer.from(csv, 'utf-8'),
      contentType: 'text/csv',
      warnings: wb.SheetNames.length > 1
        ? [`Workbook had ${wb.SheetNames.length} sheets; only "${firstSheetName}" was converted.`]
        : undefined,
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const xlsxToJson: Converter = async (input, options) => {
  try {
    const XLSX = await import('xlsx')
    const wb = await parseWorkbook(input)
    if (wb.SheetNames.length === 0) {
      return {
        ok: false,
        error: { code: 'invalid_input', message: 'XLSX has no sheets.', recoverable: true },
      }
    }
    const out: Record<string, unknown[]> = {}
    for (const name of wb.SheetNames) {
      out[name] = XLSX.utils.sheet_to_json(wb.Sheets[name])
    }
    // If only one sheet, unwrap the wrapper for cleaner JSON.
    const finalShape = wb.SheetNames.length === 1 ? out[wb.SheetNames[0]] : out
    return {
      ok: true,
      buffer: Buffer.from(JSON.stringify(finalShape, null, 2), 'utf-8'),
      contentType: 'application/json',
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const csvToXlsx: Converter = async (input, options) => {
  try {
    const Papa = (await import('papaparse')).default
    const csvText = input.toString('utf-8')
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
    if (parsed.errors.length > 0) {
      return {
        ok: false,
        error: {
          code: 'invalid_input',
          message: `CSV parse error: ${parsed.errors[0].message}`,
          recoverable: true,
        },
      }
    }
    const buf = await workbookFromRows(parsed.data as Array<Record<string, unknown>>)
    return {
      ok: true,
      buffer: buf,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  } catch (err) {
    return thrownToFailure(err)
  }
}

export const jsonToXlsx: Converter = async (input, options) => {
  try {
    const text = input.toString('utf-8')
    const parsed = JSON.parse(text)
    // Accept either an array of objects (one sheet, one row each) or an
    // object whose values are arrays of objects (one sheet per top-level key).
    if (Array.isArray(parsed)) {
      const buf = await workbookFromRows(parsed as Array<Record<string, unknown>>)
      return {
        ok: true,
        buffer: buf,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    }
    if (parsed && typeof parsed === 'object') {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()
      let sheetCount = 0
      for (const [name, rows] of Object.entries(parsed as Record<string, unknown>)) {
        if (Array.isArray(rows)) {
          const ws = XLSX.utils.json_to_sheet(rows as Array<Record<string, unknown>>)
          XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31))  // Excel sheet-name limit
          sheetCount++
        }
      }
      if (sheetCount === 0) {
        // Object wasn't sheet-shaped; treat as single one-row sheet.
        const buf = await workbookFromRows([parsed as Record<string, unknown>])
        return {
          ok: true,
          buffer: buf,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      }
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
      return {
        ok: true,
        buffer: buf,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    }
    return {
      ok: false,
      error: { code: 'invalid_input', message: 'JSON must be an array or object to convert to XLSX.', recoverable: true },
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { ok: false, error: { code: 'invalid_input', message: `Input is not valid JSON: ${err.message}`, recoverable: true } }
    }
    return thrownToFailure(err)
  }
}
