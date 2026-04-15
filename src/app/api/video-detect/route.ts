import { NextRequest, NextResponse } from "next/server";

function analyzeHead(buf: Uint8Array, sizeBytes: number, mimeHint: string): {
  deepfakeProbability: number;
  label: string;
  framesAnalyzed: number;
} {
  const mb = sizeBytes / (1024 * 1024);
  let deepfakeScore = 35;
  if (mimeHint.includes("mp4") || mimeHint.includes("video")) deepfakeScore += 6;
  if (mb > 80) deepfakeScore += 8;
  if (mb < 0.5 && sizeBytes > 10_000) deepfakeScore -= 4;
  const seed = buf.reduce((a, b) => (a + b) % 97, 0);
  deepfakeScore = Math.max(10, Math.min(90, deepfakeScore + (seed % 15) - 7));
  return {
    deepfakeProbability: deepfakeScore,
    label:
      deepfakeScore >= 60
        ? "Elevated synthetic risk (demo)"
        : deepfakeScore <= 38
          ? "Lower synthetic risk (demo)"
          : "Inconclusive (demo)",
    framesAnalyzed: Math.min(24, Math.max(4, Math.floor(Math.max(mb, 0.5) * 3))),
  };
}

async function fetchVideoHead(urlStr: string): Promise<{ buf: Uint8Array; size: number; type: string }> {
  let url: URL;
  try {
    url = new URL(urlStr);
  } catch {
    throw new Error("Invalid video URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http(s) video URLs are allowed.");
  }

  const res = await fetch(url.toString(), {
    redirect: "follow",
    signal: AbortSignal.timeout(16_000),
    headers: { Range: "bytes=0-65535" },
  });

  if (!res.ok && res.status !== 206) {
    throw new Error(`Could not fetch video (${res.status}).`);
  }

  const type = res.headers.get("content-type") || "";

  if (res.status === 206) {
    const ab = await res.arrayBuffer();
    const cr = res.headers.get("content-range");
    const total = cr
      ? parseInt(cr.split("/")[1] || String(ab.byteLength), 10)
      : ab.byteLength;
    return { buf: new Uint8Array(ab), size: total, type };
  }

  const cl = parseInt(res.headers.get("content-length") || "0", 10);
  if (cl > 2_500_000) {
    throw new Error("Video too large for URL demo — upload the file instead.");
  }
  const ab = await res.arrayBuffer();
  const head = ab.byteLength > 65536 ? ab.slice(0, 65536) : ab;
  return {
    buf: new Uint8Array(head),
    size: cl || ab.byteLength,
    type,
  };
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
      const { buf, size, type } = await fetchVideoHead(url);
      const out = analyzeHead(buf, size, type);
      return NextResponse.json({
        ...out,
        source: "url",
        note:
          "Demo readout from partial fetch — not frame analysis. Many CDNs ignore Range; upload may work better.",
      });
    }

    const form = await req.formData();
    const urlField = form.get("url");
    if (typeof urlField === "string" && urlField.trim()) {
      const { buf, size, type } = await fetchVideoHead(urlField.trim());
      const out = analyzeHead(buf, size, type);
      return NextResponse.json({
        ...out,
        source: "url",
        note: "Demo readout from URL — not real deepfake detection.",
      });
    }

    const file = form.get("file");
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json(
        { error: "Upload a video file or pass a URL." },
        { status: 400 }
      );
    }

    const head = file.slice(0, Math.min(file.size, 12_000));
    const buf = new Uint8Array(await head.arrayBuffer());
    const out = analyzeHead(buf, file.size, file.type || "");
    return NextResponse.json({
      ...out,
      source: "upload",
      note:
        "No frame decoding performed — placeholder risk band for UX. Production needs specialized video models.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not analyze video.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
