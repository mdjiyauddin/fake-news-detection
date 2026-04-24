import { NextRequest, NextResponse } from "next/server";
import { detectNews } from "@/lib/detectNews";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      text?: string;
      url?: string;
      title?: string;
      description?: string;
      content?: string;
      source_id?: string;
      creator?: string[];
      pubDate?: string;
      link?: string;
    };

    const text = (body.text || "").trim();
    const url = body.url?.trim();

    const title = (body.title || text || "").trim();
    const link = (body.link || url || "").trim() || undefined;
    const description = (body.description || "").trim() || undefined;
    const content = (body.content || "").trim() || undefined;

    if (!title && !description && !content && !link) {
      return NextResponse.json(
        { error: "Provide title/text and/or article metadata to analyze." },
        { status: 400 }
      );
    }

    const result = detectNews({
      title: title || "Untitled",
      description,
      content,
      source_id: body.source_id || undefined,
      creator: body.creator,
      pubDate: body.pubDate || undefined,
      link,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
}
