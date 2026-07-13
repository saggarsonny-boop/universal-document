import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface GenerateOptions {
  greyscale?: boolean;
}

// Draw the vector Road logo on the PDF page
export function drawRoadMark(page: any, x: number, y: number, scale: number = 0.25, mono: boolean = false) {
  const goldColor = rgb(0.83, 0.68, 0.21); // #D4AF37
  const greyColor = rgb(0.54, 0.54, 0.54); // #8A8A8A
  const seamColor = mono ? greyColor : goldColor;

  // Horizon base line
  page.drawLine({
    start: { x: x + 20 * scale, y: y + 20 * scale },
    end: { x: x + 180 * scale, y: y + 20 * scale },
    thickness: 1 * scale,
    color: rgb(0.24, 0.23, 0.21)
  });

  // Road Trapezoid
  // In pdf-lib, drawSvgPath draws at the given (x,y) coordinates
  page.drawSvgPath('M 30 180 L 88 20 L 112 20 L 170 180 Z', {
    x: x,
    y: y,
    scale: scale,
    color: rgb(0.16, 0.15, 0.13), // #2A2622
    borderColor: rgb(0.26, 0.24, 0.23),
    borderWidth: 1
  });

  // Dashed center lane line
  // We can draw it as a series of small lines
  const startY = 20;
  const endY = 180;
  const step = 20;
  for (let ly = startY; ly < endY; ly += step) {
    page.drawLine({
      start: { x: x + 100 * scale, y: y + ly * scale },
      end: { x: x + 100 * scale, y: y + (ly + 10) * scale },
      thickness: 1.5 * scale,
      color: rgb(0.35, 0.33, 0.31)
    });
  }

  // Kintsugi seam
  page.drawSvgPath('M 100 20 Q 99 35 101 50 T 97 80 T 103 115 T 98 145 T 100 180', {
    x: x,
    y: y,
    scale: scale,
    borderColor: seamColor,
    borderWidth: 3.5 * scale
  });

  // Offshoot cracks
  page.drawSvgPath('M 101 50 Q 112 55 118 52', {
    x: x,
    y: y,
    scale: scale,
    borderColor: seamColor,
    borderWidth: 2.5 * scale
  });

  page.drawSvgPath('M 97 80 Q 86 85 80 82', {
    x: x,
    y: y,
    scale: scale,
    borderColor: seamColor,
    borderWidth: 2.5 * scale
  });

  page.drawSvgPath('M 103 115 Q 114 122 120 120', {
    x: x,
    y: y,
    scale: scale,
    borderColor: seamColor,
    borderWidth: 2.5 * scale
  });

  // Horizon Dot
  page.drawCircle({
    x: x + 100 * scale,
    y: y + 20 * scale,
    radius: 4 * scale,
    color: seamColor
  });
}

// Generate templates programmatically
export async function generateTemplate(slug: string, options: GenerateOptions = {}): Promise<Buffer> {
  const isMono = !!options.greyscale;
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Set warm off-white background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 600,
    height: 800,
    color: rgb(0.96, 0.95, 0.92) // #F4F1EA
  });

  // Header Brand Lockup
  // Draw the Road Mark logo at scale
  drawRoadMark(page, 50, 720, 0.25, isMono);

  // Serif Wordmark
  const goldColor = isMono ? rgb(0.54, 0.54, 0.54) : rgb(0.83, 0.68, 0.21);
  page.drawText('THE ROAD WORKBOOKS', {
    x: 110,
    y: 735,
    size: 14,
    font: timesBold,
    color: goldColor,
  });

  page.drawLine({
    start: { x: 50, y: 705 },
    end: { x: 550, y: 705 },
    thickness: 1.5,
    color: goldColor
  });

  // Define contents based on template type
  let title = 'The Road Workbook';
  let lines: string[] = [];

  if (slug === 'first-72-hours-arrest') {
    title = 'The First 72 Hours After Arrest';
    lines = [
      'Focus: Immediate crisis containment, right-to-silence enforcement, and key documentation setup.',
      '',
      '1. SECURE THE ENVIRONMENT',
      '   - Disconnect and power down all personal devices (phones, laptops). Do not destroy evidence, but restrict access.',
      '   - Assume all calls, visits, and texts are monitored and recorded.',
      '',
      '2. EXERCISE RIGHT TO SILENCE',
      '   - Assert clearly: "I am exercising my right to remain silent and I want my attorney present."',
      '   - Do not answer any casual questions, explain circumstances, or attempt to "clear things up" with investigators.',
      '',
      '3. RETAIN COMPETENT COUNSEL',
      '   - Do not hire the cheapest local generalist. Hire a dedicated federal/state criminal defense specialist.',
      '   - Confirm fees, scope of representation, and experience with your specific jurisdiction/agency.',
      '',
      '4. ORGANIZE LOGISTICS AND FAMILY CONTINGENCY',
      '   - Establish a designated family point-of-contact for communications.',
      '   - Secure passwords, financial records, and medical needs in a trusted location.'
    ];
  } else if (slug === 'supervision-compliance-tracker') {
    title = 'Supervised Release & Probation Tracker';
    lines = [
      'Focus: Systematic tracking of compliance metrics, reporting deadlines, and supervision officer notes.',
      '',
      '1. CALENDAR AND REPORTING DEADLINES',
      '   - Set reminders for monthly written reports, drug testing windows, and office visits.',
      '   - Document the date, time, and name of every interaction with your officer.',
      '',
      '2. TRAVEL PERMISSIONS',
      '   - Submit travel requests at least 14 days in advance in writing.',
      '   - Keep copies of approved travel passes, hotel bookings, and transit confirmations.',
      '',
      '3. FINANCIAL MONITORING',
      '   - Maintain pristine records of all income, bank statements, and tax filings.',
      '   - Pay restitution/court fees on time and log every payment receipt.',
      '',
      '4. EMPLOYMENT AND COMMUNITY SERVICE Logs',
      '   - Log weekly work hours, payslips, and supervisor approvals.',
      '   - Verify community service hours are signed off by the host coordinator.'
    ];
  } else if (slug === 'talking-to-kids-case') {
    title = 'Talking To Your Kids About Your Case';
    lines = [
      'Focus: Developmentally appropriate discussion templates, crisis communications, and emotional anchoring.',
      '',
      '1. AGE-APPROPRIATE HONESTY',
      '   - Avoid scary legal jargon. Frame it as "an adult problem that adults are working to solve."',
      '   - Emphasize safety: "You are safe. I am safe. We are a family, and we will get through this together."',
      '',
      '2. RESPONDING TO QUESTIONS',
      '   - If they ask if you did something wrong: "I made a mistake, and I am taking steps to repair it."',
      '   - If they ask about prison/jail: "Sometimes adults have to go to a place to resolve things, but our love does not change."',
      '',
      '3. SCHOOL AND SOCIAL CIRCLES',
      '   - Prepare them for peers or media: "You do not have to discuss our family business with anyone. You can say: \'That is private.\'"',
      '   - Coordinate with teachers/school counselors to monitor emotional changes.'
    ];
  } else {
    // Fallback general format
    title = 'The Road Companion Guide';
    lines = [
      'This workbook template belongs to The Road Workbook series.',
      'Designed to help you navigate procedural steps and organize case materials.',
      'Please use the guidelines to construct your defense binders and track compliance.'
    ];
  }

  // Draw Title
  page.drawText(title, {
    x: 50,
    y: 650,
    size: 22,
    font: timesBold,
    color: rgb(0.1, 0.1, 0.1)
  });

  // Draw Subtitle / Line tag
  page.drawText('THE ROAD WORKBOOKS SERIES • STRATEGY & COMPLIANCE', {
    x: 50,
    y: 625,
    size: 8,
    font: boldFont,
    color: rgb(0.4, 0.4, 0.4)
  });

  // Draw Lines of Content
  let yOffset = 570;
  for (const line of lines) {
    if (line === '') {
      yOffset -= 15;
      continue;
    }
    const isHeader = line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.');
    const font = isHeader ? boldFont : regularFont;
    const size = isHeader ? 12 : 10.5;
    const color = isHeader ? rgb(0.1, 0.1, 0.1) : rgb(0.2, 0.2, 0.2);

    page.drawText(line, {
      x: line.startsWith('   -') ? 70 : 50,
      y: yOffset,
      size: size,
      font: font,
      color: color
    });
    yOffset -= 20;
  }

  // Footer Disclaimer Block
  page.drawLine({
    start: { x: 50, y: 100 },
    end: { x: 550, y: 100 },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8)
  });

  const footerDisclaimer = 'This document is for educational and informational purposes only. It does not constitute legal advice and does not create an attorney-client relationship. Supervised release requires active compliance.';
  const words = footerDisclaimer.split(' ');
  let currentLine = '';
  let footerY = 85;
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = regularFont.widthOfTextAtSize(testLine, 8);
    if (width > 500) {
      page.drawText(currentLine, { x: 50, y: footerY, size: 8, font: regularFont, color: rgb(0.5, 0.5, 0.5) });
      footerY -= 12;
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    page.drawText(currentLine, { x: 50, y: footerY, size: 8, font: regularFont, color: rgb(0.5, 0.5, 0.5) });
  }

  const generatedBytes = await pdfDoc.save();
  return Buffer.from(generatedBytes);
}
