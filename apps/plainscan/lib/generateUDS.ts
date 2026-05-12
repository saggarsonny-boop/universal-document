"use client";

import type { ExplainResult } from "@/types/plainscan";

interface UDSBlock {
  id: string;
  type: "heading" | "paragraph" | "table" | "list";
  base_content: { text: string };
}

interface UDSDocument {
  ud_version: "1.0.0";
  state: "sealed";
  metadata: {
    title: string;
    created: string;
    engine: string;
  };
  manifest: {
    block_count: number;
    types_used: Array<"heading" | "paragraph" | "table" | "list">;
  };
  blocks: UDSBlock[];
  seal: {
    sealed_at: string;
    sealed_by: string;
  };
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

export function buildUDS(result: ExplainResult): UDSDocument {
  const blocks: UDSBlock[] = [];
  let counter = 1;
  const next = () => `block-${pad(counter++)}`;

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "HivePlainScan Report Explanation" },
  });

  blocks.push({
    id: next(),
    type: "paragraph",
    base_content: { text: result.summary },
  });

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "Findings" },
  });

  result.findings.forEach((f) => {
    blocks.push({
      id: next(),
      type: "paragraph",
      base_content: { text: `${f.finding} - ${f.plainLanguage}` },
    });
  });

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "Questions for Your Doctor" },
  });

  blocks.push({
    id: next(),
    type: "list",
    base_content: { text: result.questionsForDoctor.join("\n") },
  });

  if (result.redFlags.length > 0) {
    blocks.push({
      id: next(),
      type: "heading",
      base_content: { text: "Findings That May Need Prompt Attention" },
    });
    blocks.push({
      id: next(),
      type: "list",
      base_content: { text: result.redFlags.join("\n") },
    });
  }

  blocks.push({
    id: next(),
    type: "paragraph",
    base_content: { text: result.disclaimer },
  });

  const typesSet = new Set<UDSBlock["type"]>();
  blocks.forEach((b) => typesSet.add(b.type));

  const now = new Date().toISOString();

  return {
    ud_version: "1.0.0",
    state: "sealed",
    metadata: {
      title: "HivePlainScan Report Explanation",
      created: now,
      engine: "HivePlainScan",
    },
    manifest: {
      block_count: blocks.length,
      types_used: Array.from(typesSet),
    },
    blocks,
    seal: {
      sealed_at: now,
      sealed_by: "HivePlainScan",
    },
  };
}

export function downloadUDS(result: ExplainResult): void {
  const doc = buildUDS(result);
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plainscan-report.uds";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
