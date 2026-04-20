export const UD_UTILITIES = [
	'merge',
	'split',
	'compress',
	'extract-pages',
	'rearrange-pages',
	'protect',
	'unlock',
	'ocr',
	'watermark',
	'page-numbers',
	'compare',
	'redact',
	'optimize',
] as const

export type UDUtilityId = typeof UD_UTILITIES[number]

export interface PreprocessResult {
	normalizedText: string
	utility: UDUtilityId
	summary: string
	trace: string[]
}

export function isUDUtility(value: string | null): value is UDUtilityId {
	if (!value) return false
	return (UD_UTILITIES as readonly string[]).includes(value)
}

function normalizeWhitespace(text: string): string {
	return text
		.replace(/\r\n?/g, '\n')
		.replace(/[\t ]+/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim()
}

function addPageNumbers(lines: string[]): string[] {
	return lines.map((line, idx) => `[p${idx + 1}] ${line}`)
}

function redactSensitive(text: string): string {
	return text
		.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[redacted-email]')
		.replace(/\b\+?\d[\d\s().-]{7,}\d\b/g, '[redacted-phone]')
}

export function preprocessForUD(params: {
	fileName: string
	baseText: string
	utility: UDUtilityId
}): PreprocessResult {
	const trace: string[] = []
	const cleanBase = normalizeWhitespace(params.baseText)
	const lines = cleanBase.split('\n').filter(Boolean)

	let working = cleanBase

	switch (params.utility) {
		case 'merge':
			working = lines.join('\n')
			trace.push('Merged contiguous text fragments into one flow.')
			break
		case 'split':
			working = lines.join('\n--- section break ---\n')
			trace.push('Split content into deterministic section boundaries.')
			break
		case 'compress':
			working = lines.map((line) => line.slice(0, 240)).join('\n')
			trace.push('Compressed long lines to compact normalized payload.')
			break
		case 'extract-pages':
			working = lines.filter((_, i) => i % 2 === 0).join('\n')
			trace.push('Extracted alternating pages/segments for focused conversion.')
			break
		case 'rearrange-pages':
			working = [...lines].sort((a, b) => a.localeCompare(b)).join('\n')
			trace.push('Rearranged segments into canonical lexical order.')
			break
		case 'protect':
			working = `${cleanBase}\n\n[protection-note] Source marked as protected pre-conversion.`
			trace.push('Applied protection marker prior to UDS conversion.')
			break
		case 'unlock':
			working = cleanBase.replace(/\[locked\]/gi, '').trim()
			trace.push('Removed lock markers and normalized content access.')
			break
		case 'ocr':
			working = cleanBase || `OCR placeholder generated for ${params.fileName}.`
			trace.push('Applied OCR normalization intent for image/PDF text readiness.')
			break
		case 'watermark':
			working = `[legacy-watermark-preserved]\n${cleanBase}`
			trace.push('Stamped legacy watermark marker into normalized text.')
			break
		case 'page-numbers':
			working = addPageNumbers(lines).join('\n')
			trace.push('Added stable page numbering prior to conversion.')
			break
		case 'compare':
			working = `${cleanBase}\n\n[compare-note] Normalized for structural comparison.`
			trace.push('Prepared content for deterministic compare workflow.')
			break
		case 'redact':
			working = redactSensitive(cleanBase)
			trace.push('Redacted email and phone-like patterns before conversion.')
			break
		case 'optimize':
			working = lines.map((line) => line.replace(/\s+/g, ' ')).join('\n')
			trace.push('Optimized spacing and punctuation for UDS import.')
			break
	}

	return {
		normalizedText: working,
		utility: params.utility,
		summary: `UD ${params.utility} prepared ${params.fileName} for conversion.`,
		trace,
	}
}
