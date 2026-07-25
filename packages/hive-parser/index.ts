import * as fs from 'fs';
import * as mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export interface ParseOptions {
  detectLanguage?: boolean;
  targetLanguage?: string; // for multilingual support
}

export interface ParseResult {
  text: string;
  metadata: any;
  language: string;
}

export async function parseDocument(filePath: string, buffer: Buffer, mimeType: string, options?: ParseOptions): Promise<ParseResult> {
  let extractedText = '';
  let metadata = {};

  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
      metadata = data.info;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimeType === 'text/plain') {
      extractedText = buffer.toString('utf8');
    } else {
      throw new Error(`Unsupported mime type: ${mimeType}`);
    }

    return {
      text: extractedText,
      metadata,
      language: options?.targetLanguage || 'en' // Multi-lingual placeholder
    };
  } catch (error: any) {
    console.error("Parser Error:", error.message);
    throw new Error(`Failed to parse document: ${error.message}`);
  }
}
