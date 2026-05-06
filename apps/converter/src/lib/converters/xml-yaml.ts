// XML ↔ JSON via fast-xml-parser, YAML ↔ JSON via js-yaml.

import type { Converter } from './types'
import { thrownToFailure } from './types'

export const xmlToJson: Converter = async (input, options) => {
  try {
    const { XMLParser } = await import('fast-xml-parser')
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
      trimValues: true,
    })
    const xmlText = input.toString('utf-8')
    const parsed = parser.parse(xmlText)
    return {
      ok: true,
      buffer: Buffer.from(JSON.stringify(parsed, null, 2), 'utf-8'),
      contentType: 'application/json',
    }
  } catch (err) {
    return thrownToFailure(err, { code: 'invalid_input', recoverable: true })
  }
}

export const jsonToXml: Converter = async (input, options) => {
  try {
    const { XMLBuilder } = await import('fast-xml-parser')
    const text = input.toString('utf-8')
    const parsed = JSON.parse(text)
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      indentBy: '  ',
    })
    const xml = builder.build(parsed)
    return {
      ok: true,
      buffer: Buffer.from(xml, 'utf-8'),
      contentType: 'application/xml',
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { ok: false, error: { code: 'invalid_input', message: `Input is not valid JSON: ${err.message}`, recoverable: true } }
    }
    return thrownToFailure(err)
  }
}

export const yamlToJson: Converter = async (input, options) => {
  try {
    const yaml = (await import('js-yaml'))
    const yamlText = input.toString('utf-8')
    const parsed = yaml.load(yamlText)
    return {
      ok: true,
      buffer: Buffer.from(JSON.stringify(parsed, null, 2), 'utf-8'),
      contentType: 'application/json',
    }
  } catch (err) {
    return thrownToFailure(err, { code: 'invalid_input', recoverable: true })
  }
}

export const jsonToYaml: Converter = async (input, options) => {
  try {
    const yaml = (await import('js-yaml'))
    const text = input.toString('utf-8')
    const parsed = JSON.parse(text)
    const yamlText = yaml.dump(parsed, { indent: 2, lineWidth: 100 })
    return {
      ok: true,
      buffer: Buffer.from(yamlText, 'utf-8'),
      contentType: 'application/x-yaml',
    }
  } catch (err) {
    if (err instanceof SyntaxError) {
      return { ok: false, error: { code: 'invalid_input', message: `Input is not valid JSON: ${err.message}`, recoverable: true } }
    }
    return thrownToFailure(err)
  }
}
