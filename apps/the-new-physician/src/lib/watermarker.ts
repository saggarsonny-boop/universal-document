import { PDFDocument, rgb, degrees } from 'pdf-lib';

interface WatermarkOptions {
  buyerName: string;
  buyerEmail: string;
  orderId: string;
}

export async function watermarkPdf(pdfBuffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont('Helvetica');

  const watermarkText = `${options.buyerName} · ${options.buyerEmail}`;
  const footerText = `Licensed to ${options.buyerName} (${options.buyerEmail}) · Order ${options.orderId} · Not for redistribution`;

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Draw diagonal repeating watermarks
    const angle = 45;
    const opacity = 0.08; // faint repeat
    const fontSize = 16;
    const color = rgb(0.83, 0.68, 0.21); // #D4AF37 gold color

    // Draw 3 repeating watermark text blocks diagonally
    const positions = [
      { x: width * 0.2, y: height * 0.3 },
      { x: width * 0.5, y: height * 0.5 },
      { x: width * 0.3, y: height * 0.7 }
    ];

    for (const pos of positions) {
      page.drawText(watermarkText, {
        x: pos.x,
        y: pos.y,
        size: fontSize,
        font: font,
        color: color,
        rotate: degrees(angle),
        opacity: opacity,
      });
    }

    // Draw footer line on every page
    const footerFontSize = 8;
    const footerWidth = font.widthOfTextAtSize(footerText, footerFontSize);
    page.drawText(footerText, {
      x: (width - footerWidth) / 2, // Centered
      y: 20, // 20pt from the bottom
      size: footerFontSize,
      font: font,
      color: rgb(0.5, 0.5, 0.5), // gray
      opacity: 0.8
    });
  }

  const modifiedPdfBytes = await pdfDoc.save();
  return Buffer.from(modifiedPdfBytes);
}
