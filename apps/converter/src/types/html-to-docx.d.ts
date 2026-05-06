// Minimal type shim for html-to-docx (no @types/html-to-docx published).
// The library exports a single function (default export in CJS / ESM
// equivalents) that takes (htmlString, headerHTMLString?, options?) and
// returns a Promise<Buffer | ArrayBuffer | Blob>. We narrow to what we
// actually use in apps/converter/src/lib/converters/pdf-text.ts.

declare module 'html-to-docx' {
  type DocxOutput = Buffer | ArrayBuffer | Blob

  // The library exposes a default export but TypeScript's CJS interop
  // resolves it as both `module.default` and the bare module. The
  // converter handles both shapes via `htmlToDocxModule.default ||
  // htmlToDocxModule`, so the typed signature here is the same either way.
  function htmlToDocx(
    htmlString: string,
    headerHTMLString?: string,
    documentOptions?: Record<string, unknown>,
    headerHTMLString2?: string,
  ): Promise<DocxOutput>

  export = htmlToDocx
}
