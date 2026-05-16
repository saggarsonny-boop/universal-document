"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExplainResult } from "@/types/plainscan";

const FOOTER_DISCLAIMER =
  "This explanation is based on the radiology report you provided. It is for educational purposes only. It does not diagnose your condition, recommend treatment, or replace advice from your physician.";

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i += 1) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    const wrapped = doc.splitTextToSize(FOOTER_DISCLAIMER, pageWidth - 80);
    doc.text(wrapped, 40, pageHeight - 30);
    doc.setTextColor(30, 45, 61);
  }
}

export function generatePDF(result: ExplainResult): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let cursorY = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("HivePlainScan Report Explanation", margin, cursorY);
  cursorY += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, cursorY);
  cursorY += 18;

  doc.setTextColor(30, 45, 61);
  doc.setFontSize(11);
  doc.text(`Body region: ${result.bodyRegion}`, margin, cursorY);
  cursorY += 14;
  doc.text(`Report type: ${result.reportType}`, margin, cursorY);
  cursorY += 22;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Summary", margin, cursorY);
  cursorY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(
    result.summary,
    pageWidth - margin * 2,
  );
  doc.text(summaryLines, margin, cursorY);
  cursorY += summaryLines.length * 14 + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Findings", margin, cursorY);
  cursorY += 8;

  autoTable(doc, {
    startY: cursorY,
    head: [["Finding", "Plain English", "Location", "Severity", "Possible Symptoms"]],
    body: result.findings.map((f) => [
      f.finding,
      f.plainLanguage,
      f.level ?? "",
      f.severity,
      f.possibleSymptoms.join(", "),
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 6,
      textColor: [30, 45, 61],
      lineColor: [224, 221, 214],
    },
    headStyles: {
      fillColor: [30, 45, 61],
      textColor: [250, 250, 248],
      fontSize: 9,
    },
    margin: { left: margin, right: margin },
  });

  type AutoTableDoc = jsPDF & { lastAutoTable?: { finalY: number } };
  const lastTable = (doc as AutoTableDoc).lastAutoTable;
  cursorY = (lastTable?.finalY ?? cursorY) + 24;

  if (cursorY > doc.internal.pageSize.getHeight() - 120) {
    doc.addPage();
    cursorY = margin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Questions for your doctor", margin, cursorY);
  cursorY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  result.questionsForDoctor.forEach((q, idx) => {
    const text = `${idx + 1}. ${q}`;
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    if (cursorY + lines.length * 14 > doc.internal.pageSize.getHeight() - 80) {
      doc.addPage();
      cursorY = margin;
    }
    doc.text(lines, margin, cursorY);
    cursorY += lines.length * 14 + 4;
  });

  if (result.redFlags.length > 0) {
    cursorY += 12;
    if (cursorY > doc.internal.pageSize.getHeight() - 120) {
      doc.addPage();
      cursorY = margin;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(185, 28, 28);
    doc.text(
      "The report contains findings that may need prompt attention",
      margin,
      cursorY,
    );
    cursorY += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    result.redFlags.forEach((flag) => {
      const lines = doc.splitTextToSize(`- ${flag}`, pageWidth - margin * 2);
      if (cursorY + lines.length * 14 > doc.internal.pageSize.getHeight() - 80) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(lines, margin, cursorY);
      cursorY += lines.length * 14 + 4;
    });
    doc.setTextColor(30, 45, 61);
  }

  addFooter(doc);
  doc.save("plainscan-report.pdf");
}
