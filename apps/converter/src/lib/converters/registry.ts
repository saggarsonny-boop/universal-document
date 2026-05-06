// Converter registry — maps (input, output) format pairs to the converter
// function that handles them. Single source of truth the orchestrator
// queries when chooseRoute() returns `pure-lib` or `tesseract`.
//
// Pairs not in this registry are not handled by the pure-lib / tesseract
// path. The orchestrator surfaces "not implemented" if the router asked
// for a pair we don't have a converter for (defence-in-depth: the router's
// PURE_LIB_PAIRS list and this registry should agree).

import type { Converter } from './types'
import type { InputFormat, OutputFormat, Route } from '../router'

import { csvToJson, jsonToCsv } from './csv-json'
import { csvToXlsx, jsonToXlsx, xlsxToCsv, xlsxToJson } from './spreadsheet'
import { jsonToXml, jsonToYaml, xmlToJson, yamlToJson } from './xml-yaml'
import { htmlToMd, mdToHtml, mdToTxt } from './markdown'
import { docxToHtml, docxToMd, docxToTxt } from './docx'
import { pdfToText, pdfToDocx } from './pdf-text'
import { imageToJpg, imageToPng, imageToWebp } from './image'
import { imageToText } from './ocr'

type RegistryKey = `${InputFormat}->${OutputFormat}`

function key(input: InputFormat, output: OutputFormat): RegistryKey {
  return `${input}->${output}`
}

const PURE_LIB_REGISTRY: Partial<Record<RegistryKey, Converter>> = {
  // CSV ↔ JSON / XLSX
  [key('csv', 'json')]:  csvToJson,
  [key('json', 'csv')]:  jsonToCsv,
  [key('csv', 'xlsx')]:  csvToXlsx,
  [key('xlsx', 'csv')]:  xlsxToCsv,
  [key('xlsx', 'json')]: xlsxToJson,
  [key('json', 'xlsx')]: jsonToXlsx,

  // XML ↔ JSON, YAML ↔ JSON
  [key('xml', 'json')]:  xmlToJson,
  [key('json', 'xml')]:  jsonToXml,

  // Markdown ↔ HTML, TXT
  [key('md', 'html')]:   mdToHtml,
  [key('html', 'md')]:   htmlToMd,
  [key('md', 'txt')]:    mdToTxt,

  // DOCX → HTML / MD / TXT (one-way; DOCX out lives in pdfToDocx etc)
  [key('docx', 'html')]: docxToHtml,
  [key('docx', 'md')]:   docxToMd,
  [key('docx', 'txt')]:  docxToTxt,

  // PDF → TXT / DOCX (uses PR #2's per-page extraction wrapped as a route)
  [key('pdf', 'txt')]:   pdfToText,
  [key('pdf', 'docx')]:  pdfToDocx,

  // Image → image (sharp). 'jpeg' input is normalised to 'jpg' by detectFormat
  // (both extensions and the 'image/jpeg' MIME map to InputFormat 'jpg'), so
  // we only register 'jpg' here. OutputFormat doesn't include 'jpeg' at all.
  [key('png', 'jpg')]:   imageToJpg,
  [key('png', 'webp')]:  imageToWebp,
  [key('jpg', 'png')]:   imageToPng,
  [key('jpg', 'webp')]:  imageToWebp,
  [key('webp', 'png')]:  imageToPng,
  [key('webp', 'jpg')]:  imageToJpg,
  [key('gif', 'png')]:   imageToPng,
  [key('gif', 'jpg')]:   imageToJpg,
}

const TESSERACT_REGISTRY: Partial<Record<RegistryKey, Converter>> = {
  [key('png', 'txt')]:   imageToText,
  [key('jpg', 'txt')]:   imageToText,
  [key('webp', 'txt')]:  imageToText,
}

// Note for YAML → JSON / JSON → YAML: yaml isn't an InputFormat in
// router.ts today (it's deliberately scoped to the v1 set). Add support
// here when the router taxonomy widens — the converters exist
// (yamlToJson, jsonToYaml are exported from xml-yaml.ts).
void yamlToJson
void jsonToYaml

/**
 * Return the converter for a route × format-pair combination, or null if
 * the registry doesn't have one. The orchestrator passes its chosen route
 * + the detected input/output formats; we look up the appropriate map.
 */
export function getConverter(
  route: Route,
  input: InputFormat,
  output: OutputFormat,
): Converter | null {
  if (route === 'pure-lib') {
    return PURE_LIB_REGISTRY[key(input, output)] ?? null
  }
  if (route === 'tesseract') {
    return TESSERACT_REGISTRY[key(input, output)] ?? null
  }
  return null
}
