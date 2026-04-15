"use client";

import gsap from "gsap";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef, useState, useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CoinRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price?: number[] };
};

export function CryptoSection() {
  const wrap = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [coins, setCoins] = useState<CoinRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!wrap.current) return;
    gsap.fromTo(
      wrap.current,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`/api/crypto?page=${page}`);
        const j = (await res.json()) as {
          coins?: CoinRow[];
          error?: string;
        };
        if (!res.ok) throw new Error(j.error || "Crypto feed offline");
        if (cancelled) return;
        const list = j.coins || [];
        setCoins(list);
        setSelectedId((prev) => {
          if (prev && list.some((c) => c.id === prev)) return prev;
          return list[0]?.id ?? null;
        });
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Error");
          setCoins([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const selected = useMemo(
    () => coins.find((c) => c.id === selectedId) || coins[0] || null,
    [coins, selectedId]
  );

  const bigChart = useMemo(() => {
    const pts = selected?.sparkline_in_7d?.price || [];
    return pts.map((price, i) => ({
      i,
      price,
    }));
  }, [selected]);

  const up = (selected?.price_change_percentage_24h ?? 0) >= 0;

  return (
    <section
      id="crypto"
      className="relative z-10 scroll-mt-40 px-4 py-16 md:scroll-mt-44 md:px-8"
    >
      <div ref={wrap} className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-cyan-300/80">
            Multi-asset telemetry
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[#EAEAEA] md:text-4xl">
            Crypto <span className="tg-gradient-text">markets</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#EAEAEA]/55">
            Top assets by market cap from CoinGecko — 10 per page. Tap a row to
            expand the chart on the right (desktop).
          </p>
        </motion.div>

        <div className="tg-glow-border rounded-3xl">
          <div className="tg-glass rounded-3xl p-4 md:p-6">
            {err && <p className="text-sm text-red-300/90">{err}</p>}
            {loading && (
              <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                <div className="h-[420px] animate-pulse rounded-xl bg-white/5" />
                <div className="h-[420px] animate-pulse rounded-xl bg-white/5" />
              </div>
            )}
            {!loading && coins.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
                <div className="space-y-2">
                  {coins.map((c) => {
                    const spark = c.sparkline_in_7d?.price || [];
                    const mini = spark.map((price, i) => ({ i, price }));
                    const active = selected?.id === c.id;
                    const u = (c.price_change_percentage_24h ?? 0) >= 0;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedId(c.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                          active
                            ? "border-cyan-400/45 bg-cyan-500/10"
                            : "border-white/10 bg-black/20 hover:border-white/20"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={c.image}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-full"
                          loading="lazy"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-[#EAEAEA]">
                            {c.name}{" "}
                            <span className="text-[#EAEAEA]/45">
                              {c.symbol.toUpperCase()}
                            </span>
                          </p>
                          <p className="text-sm text-cyan-200/90">
                            $
                            {(c.current_price ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits: c.current_price && c.current_price < 1 ? 6 : 2,
                            })}
                          </p>
                          <p
                            className={`text-xs font-medium ${
                              u ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            24h {u ? "▲" : "▼"}{" "}
                            {Math.abs(c.price_change_percentage_24h ?? 0).toFixed(2)}%
                          </p>
                        </div>
                        <div className="hidden h-12 w-28 sm:block">
                          {mini.length > 1 && (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={mini}>
                                <Line
                                  type="monotone"
                                  dataKey="price"
                                  stroke={u ? "#34d399" : "#fb7185"}
                                  strokeWidth={1.5}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/30 p-4 md:p-5">
                  {selected && (
                    <>
                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="text-sm text-[#EAEAEA]/55">
                            {selected.name} ({selected.symbol.toUpperCase()})
                          </p>
                          <p className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-[#EAEAEA] md:text-3xl">
                            $
                            {(selected.current_price ?? 0).toLocaleString(undefined, {
                              maximumFractionDigits:
                                selected.current_price && selected.current_price < 1 ? 6 : 2,
                            })}
                          </p>
                        </div>
                        <div
                          className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                            up
                              ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                              : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30"
                          }`}
                        >
                          24h {up ? "▲" : "▼"}{" "}
                          {Math.abs(selected.price_change_percentage_24h ?? 0).toFixed(2)}%
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-[#EAEAEA]/40">
                        7-day sparkline (CoinGecko)
                      </p>
                      <div className="mt-4 h-[280px] w-full md:h-[320px]">
                        {bigChart.length > 1 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={bigChart}>
                              <defs>
                                <linearGradient id="cpFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#00F0FF" stopOpacity={0.35} />
                                  <stop offset="100%" stopColor="#8A2BE2" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="4 8" stroke="rgba(255,255,255,0.06)" />
                              <XAxis dataKey="i" hide />
                              <YAxis
                                domain={["auto", "auto"]}
                                tick={{ fill: "rgba(234,234,234,0.45)", fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                width={72}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: "rgba(12,16,24,0.92)",
                                  border: "1px solid rgba(0,240,255,0.25)",
                                  borderRadius: 12,
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#00F0FF"
                                strokeWidth={2}
                                fill="url(#cpFill)"
                                isAnimationActive
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : (
                          <p className="flex h-full items-center justify-center text-sm text-[#EAEAEA]/45">
                            No chart data
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {!loading && coins.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-[#EAEAEA] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  ← Previous
                </button>
                <span className="text-xs text-[#EAEAEA]/45">Rank page {page}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={coins.length < 10}
                  className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-6 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
