import type { SportEvent } from "@/lib/types";

function isLive(e: SportEvent): boolean {
  const raw = e.status.trim();
  const s = raw.toLowerCase();
  if (/^\d+$/.test(raw)) return true;
  return (
    s.includes("live") ||
    /\d+\s*'/.test(e.status) ||
    s === "ht" ||
    s.includes("half time")
  );
}

function diversityScore(e: SportEvent): number {
  const L = `${e.league} ${e.sport}`.toLowerCase();
  let b = 0;
  if (L.includes("ipl") || L.includes("indian premier")) b += 55;
  else if (L.includes("cricket")) b += 38;
  if (
    L.includes("epl") ||
    L.includes("premier league") ||
    L.includes("la liga") ||
    L.includes("serie a") ||
    L.includes("bundesliga") ||
    L.includes("champions league")
  )
    b += 45;
  else if (L.includes("soccer") || L.includes("football")) b += 36;
  if (L.includes("nba") || L.includes("basketball")) b += 32;
  if (L.includes("nfl") || L.includes("american football")) b += 34;
  if (L.includes("tennis")) b += 26;
  if (L.includes("nhl") || (L.includes("hockey") && L.includes("ice"))) b += 26;
  if (L.includes("rugby")) b += 22;
  if (L.includes("baseball") || L.includes("mlb")) b += 22;
  if (L.includes("field hockey")) b += 20;
  return b;
}

export function pickFeaturedSports(events: SportEvent[], limit = 8): SportEvent[] {
  const scored = events.map((e) => ({
    e,
    score: (isLive(e) ? 1000 : 0) + diversityScore(e),
  }));
  scored.sort((a, b) => b.score - a.score);

  const out: SportEvent[] = [];
  const seen = new Set<string>();
  for (const { e } of scored) {
    if (out.length >= limit) break;
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }

  if (out.length < limit) {
    for (const e of events) {
      if (out.length >= limit) break;
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(e);
    }
  }

  return out.slice(0, limit);
}
