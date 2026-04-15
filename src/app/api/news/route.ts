import { NextRequest, NextResponse } from "next/server";
import type { NewsArticle, NewsCategory } from "@/lib/types";
import { getCached, setCached } from "@/utils/cache";

const BASE = "https://newsdata.io/api/1/news";
const BATCH = 22;
const MAX_STEPS = 4;

function buildParams(category: NewsCategory, page?: string | null) {
  const key = process.env.NEWSDATA_API_KEY;
  if (!key) throw new Error("NEWSDATA_API_KEY missing");

  const u = new URL(BASE);
  u.searchParams.set("apikey", key);
  u.searchParams.set("language", "en");

  switch (category) {
    case "india":
      u.searchParams.set("country", "in");
      break;
    case "world":
      u.searchParams.set("category", "world");
      break;
    case "technology":
      u.searchParams.set("category", "technology");
      break;
    case "business":
      u.searchParams.set("category", "business");
      break;
    case "politics":
      u.searchParams.set("category", "politics");
      break;
    default:
      u.searchParams.set("category", "top");
  }

  if (page) u.searchParams.set("page", page);
  return u.toString();
}

type AggResponse = {
  status: string;
  results: NewsArticle[];
  nextPage?: string;
  totalResults: number;
};

export async function GET(req: NextRequest) {
  const category = (req.nextUrl.searchParams.get("category") || "world") as NewsCategory;
  const page = req.nextUrl.searchParams.get("page") || undefined;

  const allowed: NewsCategory[] = [
    "india",
    "world",
    "technology",
    "business",
    "politics",
  ];
  const cat = allowed.includes(category) ? category : "world";

  const cacheKey = `newsagg:${cat}:${page || "0"}`;
  const hit = getCached<AggResponse>(cacheKey);
  if (hit) return NextResponse.json(hit);

  try {
    const merged: NewsArticle[] = [];
    const seen = new Set<string>();
    let token: string | undefined = page;
    let lastNext: string | undefined;

    for (let step = 0; step < MAX_STEPS && merged.length < BATCH; step++) {
      const url = buildParams(cat, token);
      const res = await fetch(url, { next: { revalidate: 0 } });
      const data = (await res.json()) as {
        results?: NewsArticle[];
        nextPage?: string;
        message?: string;
        status?: string;
      };

      if (!res.ok || data.status === "error") {
        if (step === 0) {
          return NextResponse.json(
            {
              error: data.message || res.statusText || "News provider error",
              status: data.status,
            },
            { status: res.ok ? 502 : res.status }
          );
        }
        break;
      }

      const chunk = data.results || [];
      for (const a of chunk) {
        const id = a.article_id || a.link;
        if (seen.has(id)) continue;
        seen.add(id);
        merged.push(a);
        if (merged.length >= BATCH) break;
      }

      lastNext = data.nextPage;
      if (!data.nextPage) break;
      token = data.nextPage;
    }

    const payload: AggResponse = {
      status: "success",
      results: merged.slice(0, BATCH),
      nextPage: lastNext,
      totalResults: merged.length,
    };

    setCached(cacheKey, payload, 90_000);
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "News fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
