"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import type { SportEvent } from "@/lib/types";
import { pickFeaturedSports } from "@/utils/pickFeaturedSports";
import { SportsScoreCard } from "./SportsScoreCard";

const PAGE_SIZE = 12;
const SPOTLIGHT = 8;

export function SportsSection() {
  const [events, setEvents] = useState<SportEvent[]>([]);
  const [at, setAt] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [page, setPage] = useState(0);

  const pull = async () => {
    try {
      const res = await fetch("/api/sports");
      const j = (await res.json()) as {
        events?: SportEvent[];
        fetchedAt?: string;
        error?: string;
      };
      if (!res.ok && !j.events) throw new Error(j.error || "Arena link down");
      setEvents(j.events || []);
      setAt(j.fetchedAt || new Date().toISOString());
      setErr(null);
      setPage(0);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sports feed error");
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    pull();
    const id = setInterval(pull, 30_000);
    return () => clearInterval(id);
  }, []);

  const featured = useMemo(
    () => pickFeaturedSports(events, SPOTLIGHT),
    [events]
  );

  const featuredIds = useMemo(
    () => new Set(featured.map((e) => e.id)),
    [featured]
  );

  const gridPool = useMemo(() => {
    if (events.length <= SPOTLIGHT) return events;
    return events.filter((e) => !featuredIds.has(e.id));
  }, [events, featuredIds]);

  const totalPages = Math.max(1, Math.ceil(gridPool.length / PAGE_SIZE));
  const slice = useMemo(() => {
    const start = page * PAGE_SIZE;
    return gridPool.slice(start, start + PAGE_SIZE);
  }, [gridPool, page]);

  useEffect(() => {
    if (page > totalPages - 1) setPage(Math.max(0, totalPages - 1));
  }, [page, totalPages]);

  return (
    <section
      id="sports"
      className="relative z-10 scroll-mt-40 px-4 py-16 md:scroll-mt-44 md:px-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute left-0 right-0 top-[42%] h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />

      <div className="relative mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="mb-10 flex flex-col gap-2 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-fuchsia-300/80">
              Live arena deck
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[#EAEAEA] md:text-4xl">
              Neon <span className="tg-gradient-text">scoreboard</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[#EAEAEA]/55">
              Spotlight picks IPL, football, NBA, NFL & more. Hover cards for 3D
              tilt. Full feed below paginates · refresh 30s.
            </p>
          </div>
          {at && (
            <p className="text-xs text-[#EAEAEA]/40">
              Last sync: {new Date(at).toLocaleTimeString()}
            </p>
          )}
        </motion.div>

        {err && (
          <p className="mb-4 text-sm text-amber-200/90">{err}</p>
        )}

        {!loaded && !err && (
          <div className="mb-12 flex gap-4 overflow-hidden pb-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-[200px] min-w-[260px] shrink-0 animate-pulse rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.5)]"
              />
            ))}
          </div>
        )}

        {loaded && featured.length > 0 && (
          <div className="mb-14">
            <p className="mb-4 font-[family-name:var(--font-orbitron)] text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400/70">
              Live spotlight · top mix
            </p>
            <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 pt-2 [scrollbar-width:thin] [scrollbar-color:rgba(0,240,255,0.35)_transparent]">
              {featured.map((e, idx) => (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ delay: Math.min(idx * 0.05, 0.35) }}
                  className="min-w-[min(88vw,290px)] shrink-0 snap-center snap-always perspective-[1000px]"
                  style={{ transformStyle: "preserve-3d" }}
                  whileHover={{
                    rotateX: 6,
                    rotateY: -10,
                    scale: 1.04,
                    z: 48,
                    transition: { type: "spring", stiffness: 280, damping: 22 },
                  }}
                >
                  <div
                    className="rounded-2xl transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(255,0,127,0.22),0_20px_50px_rgba(0,240,255,0.08)]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <SportsScoreCard e={e} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {loaded && !err && (
          <p className="mb-4 font-[family-name:var(--font-orbitron)] text-[10px] font-bold uppercase tracking-[0.35em] text-fuchsia-400/50">
            Full feed
          </p>
        )}

        {!loaded && !err && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[220px] animate-pulse rounded-2xl border border-white/10 bg-[rgba(10,12,18,0.5)]"
              />
            ))}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loaded &&
            slice.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
                whileHover={{
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
              >
                <SportsScoreCard e={e} />
              </motion.div>
            ))}
        </div>

        {loaded && gridPool.length > PAGE_SIZE && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-[#EAEAEA] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              ← Previous
            </button>
            <span className="text-xs text-[#EAEAEA]/45">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-6 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next →
            </button>
          </div>
        )}

        {loaded && !events.length && err === null && (
          <p className="mt-8 text-center text-sm text-[#EAEAEA]/45">
            No fixtures in this window — check back during match days.
          </p>
        )}
      </div>
    </section>
  );
}
