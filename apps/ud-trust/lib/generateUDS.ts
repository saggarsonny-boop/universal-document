"use client";

import type { ExplainResult } from "@/types/plainscan";

type UDSBlockType = "heading" | "paragraph" | "table" | "list" | "image";

interface UDSBlock {
  id: string;
  type: UDSBlockType;
  base_content:
    | { text: string }
    | { url: string; alt: string; source?: "openai" | "replicate" | "svg" | "ai" };
}

interface GovernanceStampPlaceholder {
  status: "pending";
  engine_id: string;
  intended_schema: "lookup-response";
  generated_at: string;
}

export interface UDSDocument {
  ud_version: "1.0.0";
  state: "sealed";
  metadata: {
    id: string;
    created_at: string;
    updated_at: string;
    created_by: string;
    revoked: boolean;
  };
  manifest: {
    base_language: string;
    language_manifest: string[];
    clarity_layer_manifest: string[];
    permissions: string[];
  };
  blocks: UDSBlock[];
  governance: GovernanceStampPlaceholder;
  seal: {
    hash: string;
    chain_of_custody: string[];
  };
}

function pad(n: number): string {
  return String(n).padStart(3, "0");
}

function canonicalBlockPayload(blocks: UDSBlock[]): string {
  const stable = blocks.map((b) => ({
    base_content: b.base_content,
    id: b.id,
    type: b.type,
  }));
  return JSON.stringify(stable);
}

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return "unavailable";
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function buildUDS(result: ExplainResult): Promise<UDSDocument> {
  const blocks: UDSBlock[] = [];
  let counter = 1;
  const next = () => \`block-\${pad(counter++)}\`;
  const now = new Date().toISOString();

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "Document Explanation" },
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
      base_content: {
        text: \`\${f.finding} — \${f.plainLanguage}\${f.severity && f.severity !== "not specified" ? \` (severity: \${f.severity})\` : ""}\`,
      },
    });
  });

  if (result.illustrationUrl) {
    blocks.push({
      id: next(),
      type: "heading",
      base_content: { text: "Illustration" },
    });
    blocks.push({
      id: next(),
      type: "image",
      base_content: {
        url: result.illustrationUrl,
        alt: "Illustration generated to accompany the report explanation.",
        source: result.illustrationSource ?? "svg",
      },
    });
  }

  blocks.push({
    id: next(),
    type: "heading",
    base_content: { text: "Questions for Your Specialist" },
  });

  blocks.push({
    id: next(),
    type: "list",
    base_content: { text: result.questionsForDoctor.join("\\n") },
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
      base_content: { text: result.redFlags.join("\\n") },
    });
  }

  blocks.push({
    id: next(),
    type: "paragraph",
    base_content: { text: result.disclaimer },
  });

  const hash = await sha256Hex(canonicalBlockPayload(blocks));

  return {
    ud_version: "1.0.0",
    state: "sealed",
    metadata: {
      id: generateUUID(),
      created_at: now,
      updated_at: now,
      created_by: "Hive UD Engine",
      revoked: false
    },
    manifest: {
      base_language: "en",
      language_manifest: ["en"],
      clarity_layer_manifest: ["plain-english"],
      permissions: ["read"]
    },
    blocks,
    governance: {
      status: "pending",
      engine_id: "hive-universal-document",
      intended_schema: "lookup-response",
      generated_at: now,
    },
    seal: {
      hash: hash,
      chain_of_custody: ["Hive UD Engine"],
    },
  };
}

export async function downloadUDS(result: ExplainResult): Promise<void> {
  const doc = await buildUDS(result);
  const json = JSON.stringify(doc, null, 2);
  const blob = new Blob([json], { type: "application/uds+json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "processed-document.uds";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
