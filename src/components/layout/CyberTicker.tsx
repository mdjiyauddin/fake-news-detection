"use client";

import { useEffect, useMemo, useState } from "react";

type Seg = { key: string; icon: string; label: string };

export function CyberTicker() {
  const [headline, setHeadline] = useState<string | null>(null);
  const [btc, setBtc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [nRes, cRes] = await Promise.all([
          fetch("/api/news?category=world"),
          fetch("/api/crypto?page=1"),
        ]);
        const nj = (await nRes.json()) as { results?: { title?: string }[] };
        const cj = (await cRes.json()) as {
          coins?: { symbol?: string; current_price?: number }[];
        };
        if (cancelled) return;
        const t = nj.results?.[0]?.title;
        if (t) setHeadline(t.slice(0, 64) + (t.length > 64 ? "…" : ""));
        const top = cj.coins?.find((c) => c.symbol?.toLowerCase() === "btc");
        const alt = cj.coins?.[0];
        const pick = top || alt;
        if (pick?.current_price != null) {
          setBtc(
            `${(pick.symbol || "BTC").toUpperCase()} $${pick.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
          );
        }
      } catch {
        /* ignore */
      }
    })();
    const id = setInterval(() => {
      (async () => {
        try {
          const cRes = await fetch("/api/crypto?page=1");
          const cj = (await cRes.json()) as {
            coins?: { symbol?: string; current_price?: number }[];
          };
          const top = cj.coins?.find((c) => c.symbol?.toLowerCase() === "btc");
          const pick = top || cj.coins?.[0];
          if (pick?.current_price != null) {
            setBtc(
              `${(pick.symbol || "BTC").toUpperCase()} $${pick.current_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            );
          }
        } catch {
          /* ignore */
        }
      })();
    }, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const segments: Seg[] = useMemo(
    () => [
      { key: "a", icon: "📰", label: "Breaking news wire · live sync" },
      { key: "b", icon: "⚽", label: "Sports arena · live mesh" },
      { key: "c", icon: "🤖", label: "AI Fake News Detection · active" },
      {
        key: "d",
        icon: "₿",
        label: btc ? `Crypto pulse · ${btc}` : "Crypto · loading telemetry…",
      },
      {
        key: "e",
        icon: "📡",
        label: headline
          ? `World pulse · ${headline}`
          : "World pulse · headlines loading…",
      },
      { key: "f", icon: "🛡️", label: "Truth mesh · secure handoff" },
    ],
    [btc, headline]
  );

  /** Single continuous line (one visual stream). Second copy exists only for seamless loop off-screen. */
  const line = useMemo(() => {
    return segments
      .map((s) => `${s.icon} ${s.label}`)
      .join("     \u25C6     ");
  }, [segments]);

  return (
    <div className="relative z-40 border-b border-cyan-500/20 bg-[#060608]/95 shadow-[0_0_24px_rgba(0,240,255,0.08)] backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent" />

      <div className="tg-ticker-fade relative overflow-hidden">
        <div className="tg-ticker-track flex items-center">
          <p
            className="shrink-0 whitespace-nowrap py-2.5 pl-6 pr-16 font-[family-name:var(--font-orbitron)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00F0FF] md:text-xs"
            style={{ textShadow: "0 0 14px rgba(0,240,255,0.35)" }}
          >
            <span className="text-[#FF007F]" style={{ textShadow: "0 0 10px rgba(255,0,127,0.7)" }}>
              ◆
            </span>{" "}
            {line}{" "}
            <span className="text-[#FF007F]" style={{ textShadow: "0 0 10px rgba(255,0,127,0.7)" }}>
              ◆
            </span>
          </p>
          <p
            className="shrink-0 whitespace-nowrap py-2.5 pr-16 font-[family-name:var(--font-orbitron)] text-[11px] font-semibold uppercase tracking-[0.14em] text-[#00F0FF] md:text-xs"
            style={{ textShadow: "0 0 14px rgba(0,240,255,0.35)" }}
            aria-hidden
          >
            <span className="text-[#FF007F]" style={{ textShadow: "0 0 10px rgba(255,0,127,0.7)" }}>
              ◆
            </span>{" "}
            {line}{" "}
            <span className="text-[#FF007F]" style={{ textShadow: "0 0 10px rgba(255,0,127,0.7)" }}>
              ◆
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
