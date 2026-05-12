// Server-side document text extraction. Used for DOCX (mammoth); PDF
// continues to be extracted client-side via pdfjs-dist in ReportInput so
// the route only ships the file types that genuinely need server work.
//
// 10 MB cap matches Vercel's hobby-tier route handler body limit. Anything
// larger should fall back to the paste tab.

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}

function normalizeText(text: string): string {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Upload a DOCX report." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Upload under 10 MB." },
      { status: 400 },
    );
  }

  const fileName = file.name.toLowerCase();
  const isDocx =
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx");

  if (!isDocx) {
    return NextResponse.json(
      {
        error:
          "Unsupported file type for this endpoint. Use the PDF tab for PDF files.",
      },
      { status: 415 },
    );
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const text = normalizeText(await extractDocx(bytes));
    if (text.length < 20) {
      return NextResponse.json(
        {
          error:
            "Could not find enough readable text. Try copying and pasting the report.",
        },
        { status: 422 },
      );
    }
    return NextResponse.json({
      fileName: file.name,
      reportText: text,
      characterCount: text.length,
    });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not extract text from this DOCX file. Try a different file or paste the report manually.",
      },
      { status: 422 },
    );
  }
}
