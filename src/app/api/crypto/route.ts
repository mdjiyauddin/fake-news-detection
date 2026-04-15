import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached } from "@/utils/cache";

const PER_PAGE = 10;

type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price?: number[] };
};

export async function GET(req: NextRequest) {
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1", 10) || 1);
  const cacheKey = `crypto:markets:${page}`;
  const hit = getCached<{ coins: CoinRow[]; page: number; perPage: number }>(cacheKey);
  if (hit) return NextResponse.json(hit);

  try {
    const url = new URL("https://api.coingecko.com/api/v3/coins/markets");
    url.searchParams.set("vs_currency", "usd");
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));
    url.searchParams.set("sparkline", "true");
    url.searchParams.set("price_change_percentage", "24h");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "CoinGecko markets request failed" },
        { status: 502 }
      );
    }

    const rows = (await res.json()) as CoinRow[];
    const payload = {
      coins: rows,
      page,
      perPage: PER_PAGE,
    };

    setCached(cacheKey, payload, 45_000);
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Crypto fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
