import { NextResponse } from "next/server";
import { getCached, setCached } from "@/utils/cache";
import type { SportEvent } from "@/lib/types";

const KEY = "3";

type Raw = Record<string, string | null | undefined>;

function pick(r: Raw, ...keys: string[]): string {
  for (const k of keys) {
    const v = r[k];
    if (typeof v === "string" && v.length) return v;
  }
  return "";
}

function fromSoccerLive(r: Raw): SportEvent | null {
  const home = pick(r, "strHomeTeam");
  const away = pick(r, "strAwayTeam");
  if (!home || !away) return null;
  return {
    id: pick(r, "idEvent") || `${home}-${away}-live`,
    league: pick(r, "strLeague") || "Football",
    home,
    away,
    homeScore: pick(r, "intHomeScore") || "—",
    awayScore: pick(r, "intAwayScore") || "—",
    status: pick(r, "strProgress") || "Live",
    sport: "Football",
    dateEvent: pick(r, "dateEvent"),
  };
}

function fromDayEvent(r: Raw, sportLabel: string): SportEvent | null {
  const home = pick(r, "strHomeTeam");
  const away = pick(r, "strAwayTeam");
  if (!home || !away) return null;
  const league = pick(r, "strLeague").toLowerCase();
  let sportTag = pick(r, "strSport") || sportLabel;
  if (league.includes("ipl") || league.includes("indian premier")) {
    sportTag = "Cricket · IPL";
  } else if (league.includes("hockey") && league.includes("india")) {
    sportTag = "Hockey · India";
  }
  return {
    id: pick(r, "idEvent") || `${home}-${away}-${sportLabel}`,
    league: pick(r, "strLeague") || sportLabel,
    home,
    away,
    homeScore: pick(r, "intHomeScore") || "—",
    awayScore: pick(r, "intAwayScore") || "—",
    status: pick(r, "strStatus") || "Scheduled",
    sport: sportTag,
    dateEvent: pick(r, "dateEvent"),
  };
}

const SPORTS_QUERIES = [
  "Soccer",
  "Cricket",
  "Basketball",
  "American Football",
  "Ice Hockey",
  "Baseball",
  "Rugby",
  "Tennis",
  "Field Hockey",
] as const;

export async function GET() {
  const cacheKey = "sports:v2";
  const hit = getCached<{ events: SportEvent[]; fetchedAt: string }>(cacheKey);
  if (hit) return NextResponse.json(hit);

  const today = new Date().toISOString().slice(0, 10);
  const events: SportEvent[] = [];
  const seen = new Set<string>();

  const push = (e: SportEvent) => {
    if (seen.has(e.id)) return;
    seen.add(e.id);
    events.push(e);
  };

  try {
    const liveSoccerUrl = `https://www.thesportsdb.com/api/v1/json/${KEY}/livescore.php?s=Soccer`;
    const dayUrls = SPORTS_QUERIES.map(
      (s) =>
        `https://www.thesportsdb.com/api/v1/json/${KEY}/eventsday.php?d=${today}&s=${encodeURIComponent(s)}`
    );

    const [liveSoccer, ...dayResults] = await Promise.all([
      fetch(liveSoccerUrl),
      ...dayUrls.map((u) => fetch(u)),
    ]);

    if (liveSoccer.ok) {
      const j = (await liveSoccer.json()) as { events?: Raw[] };
      for (const r of j.events || []) {
        const m = fromSoccerLive(r);
        if (m) push(m);
      }
    }

    for (const res of dayResults) {
      if (!res.ok) continue;
      const j = (await res.json()) as { events?: Raw[] };
      for (const r of j.events || []) {
        const label = pick(r, "strSport") || "Sport";
        const m = fromDayEvent(r, label);
        if (m) push(m);
      }
    }

    const payload = {
      events: events.slice(0, 120),
      fetchedAt: new Date().toISOString(),
    };

    setCached(cacheKey, payload, 30_000);
    return NextResponse.json(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Sports fetch failed";
    return NextResponse.json({
      error: msg,
      events: [],
      fetchedAt: new Date().toISOString(),
    });
  }
}
