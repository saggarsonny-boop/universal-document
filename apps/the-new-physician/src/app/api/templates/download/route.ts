import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { watermarkPdf } from '@/lib/watermarker';
import { PDFDocument, rgb } from 'pdf-lib';
import { generateTemplate } from '@/lib/pdf-pipeline';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new Response('Download token is required', { status: 400 });
    }

    // Find the order
    const order = await db.order.findUnique({
      where: { download_token: token }
    });

    if (!order) {
      return new Response('Invalid download link', { status: 404 });
    }

    if (order.token_expires_at && new Date() > order.token_expires_at) {
      return new Response('This download link has expired (valid for 24h only)', { status: 410 });
    }

    // Get the product
    const product = await db.product.findUnique({
      where: { id: order.product_id }
    });

    if (!product) {
      return new Response('Associated product not found', { status: 404 });
    }

    let pdfBytes: Buffer;

    try {
      pdfBytes = await generateTemplate(product.slug, { greyscale: false });
    } catch (err) {
      // Bulletproof fallback: generate a beautiful placeholder PDF on the fly using pdf-lib
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont('Helvetica-Bold');
      const regularFont = await pdfDoc.embedFont('Helvetica');

      // Draw Header
      page.drawText('THE NEW PHYSICIAN LIBRARY', {
        x: 50,
        y: 730,
        size: 10,
        font: font,
        color: rgb(0.83, 0.68, 0.21), // Gold
      });

      page.drawLine({
        start: { x: 50, y: 715 },
        end: { x: 550, y: 715 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      // Draw Title
      page.drawText(product.title, {
        x: 50,
        y: 660,
        size: 24,
        font: font,
        color: rgb(0.09, 0.12, 0.19), // Dark Blue
      });

      // Draw Metadata
      page.drawText(`Format: ${product.format.toUpperCase()} | Version: ${product.version}`, {
        x: 50,
        y: 630,
        size: 10,
        font: regularFont,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Draw Description
      const descLines = [
        product.short_description,
        '',
        product.long_description,
        '',
        '--- Legal & Clinical Disclaimers ---',
        'This document is for educational and informational purposes only.',
        'If it relates to legal matters, it does not constitute legal advice and does not create an attorney-client relationship.',
        'If it relates to clinical or career matters, it does not imply an active clinical practice or guarantee certification outcomes.'
      ];

      let yOffset = 580;
      for (const line of descLines) {
        if (line === '') {
          yOffset -= 15;
          continue;
        }
        // Split line into smaller chunks if it exceeds page width
        const words = line.split(' ');
        let currentLine = '';
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const width = regularFont.widthOfTextAtSize(testLine, 11);
          if (width > 500) {
            page.drawText(currentLine, { x: 50, y: yOffset, size: 11, font: regularFont, color: rgb(0.2, 0.2, 0.2) });
            yOffset -= 18;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          page.drawText(currentLine, { x: 50, y: yOffset, size: 11, font: regularFont, color: rgb(0.2, 0.2, 0.2) });
          yOffset -= 22;
        }
      }

      const generatedBytes = await pdfDoc.save();
      pdfBytes = Buffer.from(generatedBytes);
    }

    // Apply personalized watermarking
    const watermarkedBytes = await watermarkPdf(pdfBytes, {
      buyerName: order.buyer_name,
      buyerEmail: order.buyer_email,
      orderId: order.id
    });

    // Return file stream response
    return new Response(new Uint8Array(watermarkedBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${product.slug}.pdf"`,
        'Content-Length': watermarkedBytes.length.toString()
      }
    });
  } catch (error: any) {
    console.error('Download route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
