"use client";

import type { ExplainResult } from "@/types/plainscan";

interface Props {
  result: ExplainResult;
}

export default function IllustrationDisplay({ result }: Props) {
  if (!result.illustrationUrl) return null;
  const isAi = result.illustrationSource === "ai";
  return (
    <section className="section" aria-label="Educational illustration">
      <h2>Visual summary</h2>
      <img
        src={result.illustrationUrl}
        alt={`Educational illustration of ${result.bodyRegion || "report findings"}`}
        style={{
          width: "100%",
          maxWidth: 720,
          height: "auto",
          borderRadius: 12,
          border: "1px solid var(--line)",
          display: "block",
          marginTop: "0.5rem",
        }}
      />
      <p
        style={{
          marginTop: "0.5rem",
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}
      >
        {isAi
          ? "AI-generated educational illustration based on report text."
          : "Schematic diagram based on report text."}{" "}
        Not an actual medical image. Not to scale.
      </p>
    </section>
  );
}
