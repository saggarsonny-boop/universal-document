// Replicate FLUX Schnell wrapper for medical illustrations. Free tier;
// $0/month if traffic stays low. Returns null on any failure — caller must
// handle absence with the SVG diagram fallback.
//
// REPLICATE_API_TOKEN absent → returns null synchronously. Caller treats
// that as "use the SVG diagram instead". This keeps the engine free-tier
// usable without any image generation provider configured.

import type { ExplainResult } from "@/types/plainscan";

const MODEL = "black-forest-labs/flux-schnell";

function spineRegion(result: ExplainResult): string {
  const combined = `${result.bodyRegion} ${result.findings
    .map((f) => `${f.level || ""} ${f.finding} ${f.plainLanguage}`)
    .join(" ")}`;
  if (/\bC\d|cervical/i.test(combined)) return "cervical spine";
  if (/\bL\d|lumbar/i.test(combined)) return "lumbar spine";
  if (/\bT\d|thoracic/i.test(combined)) return "thoracic spine";
  return result.bodyRegion || "reported anatomy";
}

/** Build a structured prompt for FLUX from the explanation. Kept short
 *  because FLUX Schnell respects ~256-token prompts and nothing longer. */
export function buildIllustrationPrompt(result: ExplainResult): string {
  const findings = result.findings
    .slice(0, 4)
    .map((f) => {
      const sev =
        f.severity && f.severity !== "not specified" ? `${f.severity} ` : "";
      return `${f.level || "anatomy"}: ${sev}${f.finding}`;
    })
    .join(", ");

  const region = spineRegion(result);

  return `Patient education medical illustration of the ${region}. Hand-painted anatomical realism, warm bone tones, blue-grey intervertebral discs, yellow nerve roots, clean white background, color-coded callout labels for: ${findings || "reported findings"}. Educational atlas style, no real scan data, no faces, no text overlays.`;
}

/** Generate a medical illustration via Replicate FLUX Schnell. Returns the
 *  image URL on success, null on any failure (missing token, HTTP error,
 *  malformed response, prediction timeout). */
export async function generateIllustration(
  result: ExplainResult,
): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;

  const prompt = buildIllustrationPrompt(result);

  try {
    const create = await fetch(
      `https://api.replicate.com/v1/models/${MODEL}/predictions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait=60",
        },
        body: JSON.stringify({
          input: {
            prompt,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "webp",
            output_quality: 80,
            go_fast: true,
            megapixels: "1",
            disable_safety_checker: false,
          },
        }),
      },
    );
    if (!create.ok) return null;
    const data = (await create.json()) as {
      output?: string | string[];
      status?: string;
      urls?: { get: string };
    };
    if (Array.isArray(data.output) && data.output[0]) return data.output[0];
    if (typeof data.output === "string") return data.output;
    if (data.urls?.get) return await pollPrediction(data.urls.get, token);
    return null;
  } catch {
    return null;
  }
}

async function pollPrediction(url: string, token: string): Promise<string | null> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as {
        status: string;
        output?: string | string[];
      };
      if (data.status === "succeeded") {
        if (Array.isArray(data.output) && data.output[0]) return data.output[0];
        if (typeof data.output === "string") return data.output;
        return null;
      }
      if (data.status === "failed" || data.status === "canceled") return null;
    } catch {
      return null;
    }
  }
  return null;
}
