import { NextRequest, NextResponse } from "next/server";

function shannonEntropy(buf: Uint8Array): number {
  const counts = new Array(256).fill(0);
  for (let i = 0; i < buf.length; i++) counts[buf[i]!]++;
  let h = 0;
  const n = buf.length;
  for (let i = 0; i < 256; i++) {
    const c = counts[i]!;
    if (!c) continue;
    const p = c / n;
    h -= p * Math.log2(p);
  }
  return h;
}

function scoreFromBytes(bytes: Uint8Array, mimeHint: string): {
  aiProbability: number;
  label: string;
  confidence: number;
} {
  const ent = shannonEntropy(bytes);
  let aiScore = 42;
  if (ent > 7.6) aiScore += 14;
  if (ent < 5.2) aiScore -= 12;
  if (mimeHint.includes("png")) aiScore += 4;
  const jitter = (bytes[0]! + bytes[Math.min(100, bytes.length - 1)]!) % 9;
  aiScore = Math.max(8, Math.min(92, aiScore + jitter - 4));
  const label =
    aiScore >= 58 ? "Likely AI-generated" : aiScore <= 40 ? "Likely authentic" : "Uncertain";
  return {
    aiProbability: aiScore,
    label,
    confidence: Math.round(55 + Math.min(35, Math.abs(aiScore - 50) * 0.6)),
  };
}

async function fetchImageUrl(urlStr: string): Promise<{ bytes: Uint8Array; type: string }> {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    throw new Error("Invalid image URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http(s) image URLs are allowed.");
  }

  const res = await fetch(url.toString(), {
    redirect: "follow",
    signal: AbortSignal.timeout(14_000),
    headers: { Accept: "image/*,*/*" },
  });

  if (!res.ok) throw new Error(`Could not fetch URL (${res.status}).`);

  const type = res.headers.get("content-type") || "";
  if (!type.startsWith("image/") && !type.includes("octet-stream")) {
    throw new Error("URL did not return an image content-type.");
  }

  const buf = await res.arrayBuffer();
  if (buf.byteLength > 4_000_000) {
    throw new Error("Image too large (max ~4MB for demo).");
  }
  const slice = buf.byteLength > 48_000 ? buf.slice(0, 48_000) : buf;
  return { bytes: new Uint8Array(slice), type };
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";

    if (ct.includes("application/json")) {
      const body = (await req.json()) as { url?: string };
      const url = body.url?.trim();
      if (!url) {
        return NextResponse.json(
          { error: "Provide { \"url\": \"https://...\" } or multipart file." },
          { status: 400 }
        );
      }
      const { bytes, type } = await fetchImageUrl(url);
      const out = scoreFromBytes(bytes, type);
      return NextResponse.json({
        ...out,
        source: "url",
        note:
          "Demo signal from fetched bytes — not a vision model. Many hosts block hotlinking; upload file if this fails.",
      });
    }

    const form = await req.formData();
    const urlField = form.get("url");
    if (typeof urlField === "string" && urlField.trim()) {
      const { bytes, type } = await fetchImageUrl(urlField.trim());
      const out = scoreFromBytes(bytes, type);
      return NextResponse.json({
        ...out,
        source: "url",
        note:
          "Demo signal from URL — not a vision model. Use upload if the server cannot fetch the link.",
      });
    }

    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json(
        { error: "Upload an image file or pass a URL." },
        { status: 400 }
      );
    }

    const slice = file.slice(0, Math.min(file.size, 48_000));
    const ab = await slice.arrayBuffer();
    const bytes = new Uint8Array(ab);
    const out = scoreFromBytes(bytes, file.type || "");
    return NextResponse.json({
      ...out,
      source: "upload",
      note:
        "Demo signal based on byte entropy and type — not a vision model. For real attribution use dedicated AI-image detectors.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not analyze image.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
