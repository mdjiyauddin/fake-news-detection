import { NextRequest, NextResponse } from "next/server";
import { analyzeNewsText } from "@/utils/fakeNewsHeuristic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string; url?: string };
    const text = (body.text || "").trim();
    const url = body.url?.trim() || null;

    if (!text && !url) {
      return NextResponse.json(
        { error: "Provide news text and/or a URL to analyze." },
        { status: 400 }
      );
    }

    const combined =
      text ||
      (url
        ? `Headline or article URL submitted for review: ${url}. No article body was fetched automatically.`
        : "");

    const result = analyzeNewsText(combined, url);
    return NextResponse.json({
      ...result,
      note: "Heuristic preview — not a courtroom-grade model. Pair with human review and dedicated hate-speech APIs for production.",
    });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}
