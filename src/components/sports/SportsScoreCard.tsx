"use client";

import type { SportEvent } from "@/lib/types";

function hashHue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

function TeamOrb({ name }: { name: string }) {
  const hue = hashHue(name);
  const hue2 = (hue + 40) % 360;
  return (
    <div
      className="relative h-14 w-14 shrink-0 rounded-full shadow-[inset_-6px_-8px_16px_rgba(0,0,0,0.55),inset_4px_6px_14px_rgba(255,255,255,0.12)] ring-1 ring-white/10 md:h-16 md:w-16"
      style={{
        background: `radial-gradient(circle at 32% 28%, hsl(${hue2} 85% 62%), hsl(${hue} 72% 42%) 45%, hsl(${hue} 85% 22%) 100%)`,
      }}
      title={name}
      aria-hidden
    />
  );
}

function leagueIcon(sport: string, league: string): string {
  const t = `${sport} ${league}`.toLowerCase();
  if (t.includes("cricket") || t.includes("ipl")) return "🏏";
  if (
    t.includes("football") ||
    t.includes("soccer") ||
    t.includes("epl") ||
    t.includes("laliga")
  )
    return "⚽";
  if (t.includes("basketball") || t.includes("nba")) return "🏀";
  if (t.includes("tennis")) return "🎾";
  if (t.includes("hockey") || t.includes("nhl")) return "🏒";
  if (t.includes("rugby")) return "🏉";
  if (t.includes("baseball")) return "⚾";
  return "🌐";
}

type MatchKind = "live" | "finished" | "upcoming";

function classify(e: SportEvent): MatchKind {
  const raw = e.status.trim();
  const s = raw.toLowerCase();
  const hasScores = e.homeScore !== "—" && e.awayScore !== "—";

  if (/^\d+$/.test(raw)) {
    return "live";
  }

  if (
    s.includes("live") ||
    /\d+\s*'/.test(e.status) ||
    s === "ht" ||
    s.includes("half time")
  ) {
    return "live";
  }

  if (
    s.includes("not started") ||
    s.includes("scheduled") ||
    s === "ns" ||
    s.includes("postponed")
  ) {
    return "upcoming";
  }

  if (!hasScores) {
    return "upcoming";
  }

  if (
    s.includes("finish") ||
    s.includes("full time") ||
    s.includes("ft") ||
    s.includes("final") ||
    s.includes("ended") ||
    s.includes("after full")
  ) {
    return "finished";
  }

  if (hasScores && !s.includes("live") && !/\d+\s*'/.test(e.status)) {
    return "finished";
  }

  return "live";
}

function StatusBadge({ kind }: { kind: MatchKind }) {
  if (kind === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF007F]/45 bg-[#FF007F]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FF007F] shadow-[0_0_16px_rgba(255,0,127,0.35)]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF007F]" />
        Live
      </span>
    );
  }
  if (kind === "finished") {
    return (
      <span className="inline-flex items-center rounded-full border border-cyan-400/35 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
        Full time
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#EAEAEA]/55">
      <span aria-hidden>⏱</span>
      Upcoming
    </span>
  );
}

function footerLine(e: SportEvent, kind: MatchKind): string {
  if (kind === "upcoming" && e.dateEvent) {
    return `Match window · ${e.dateEvent}`;
  }
  if (kind === "live") {
    return `${e.status} · ${e.league}`;
  }
  if (e.dateEvent) {
    return `${e.dateEvent} · ${e.league}`;
  }
  return e.league;
}

export function SportsScoreCard({ e }: { e: SportEvent }) {
  const kind = classify(e);
  const icon = leagueIcon(e.sport, e.league);
  const leagueShort =
    e.league.length > 24 ? `${e.league.slice(0, 22)}…` : e.league;

  const cricketish =
    e.homeScore.includes("/") ||
    e.awayScore.includes("/") ||
    e.sport.toLowerCase().includes("cricket");

  const scoreCenter = cricketish
    ? `${e.homeScore} vs ${e.awayScore}`
    : `${e.homeScore} - ${e.awayScore}`;

  const liveGlow = kind === "live";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[rgba(10,12,18,0.72)] shadow-[0_24px_48px_rgba(0,0,0,0.5)] backdrop-blur-xl">
      <div className="h-[3px] w-full bg-gradient-to-r from-[#FF007F] via-[#8A2BE2] to-[#00F0FF] opacity-90" />
      <div className="p-4 md:p-5">
        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
          <span className="text-lg" aria-hidden>
            {icon}
          </span>
          <span className="font-[family-name:var(--font-orbitron)] text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF007F] md:text-[11px]">
            {leagueShort}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <TeamOrb name={e.home} />
            <p className="w-full text-center text-[11px] font-semibold leading-tight text-[#EAEAEA] md:text-xs">
              {e.home}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-center px-1">
            <p
              className={`font-[family-name:var(--font-orbitron)] text-center text-base font-black leading-tight text-[#EAEAEA] md:text-lg ${
                liveGlow ? "tg-sports-score-live text-[#FF007F]" : ""
              }`}
            >
              {scoreCenter}
            </p>
            <div className="mt-3 flex justify-center">
              <StatusBadge kind={kind} />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <TeamOrb name={e.away} />
            <p className="w-full text-center text-[11px] font-semibold leading-tight text-[#EAEAEA] md:text-xs">
              {e.away}
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-[#EAEAEA]/40 md:text-[11px]">
          {footerLine(e, kind)}
        </p>
        <p className="mt-1 text-center text-[9px] uppercase tracking-wider text-cyan-400/35">
          {e.sport}
        </p>
      </div>
    </article>
  );
}
