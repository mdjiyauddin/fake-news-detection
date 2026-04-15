"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import type { NewsArticle, NewsCategory } from "@/lib/types";
import { NewsCard } from "./NewsCard";
import { NewsModal } from "./NewsModal";
import { NewsSkeleton } from "./NewsSkeleton";

const TABS: { id: NewsCategory; label: string }[] = [
  { id: "india", label: "India" },
  { id: "world", label: "World" },
  { id: "technology", label: "Technology" },
  { id: "business", label: "Business" },
  { id: "politics", label: "Politics" },
];

export function NewsSection() {
  const [tab, setTab] = useState<NewsCategory>("world");
  const [items, setItems] = useState<NewsArticle[]>([]);
  const [nextPage, setNextPage] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<NewsArticle | null>(null);
  const [cursorStack, setCursorStack] = useState<(string | undefined)[]>([
    undefined,
  ]);

  const startToken = cursorStack[cursorStack.length - 1];

  const load = useCallback(async (category: NewsCategory, page?: string) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({ category });
      if (page) qs.set("page", page);
      const res = await fetch(`/api/news?${qs.toString()}`);
      const data = (await res.json()) as {
        results?: NewsArticle[];
        nextPage?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "News error");
      setItems(data.results || []);
      setNextPage(data.nextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load news");
      setItems([]);
      setNextPage(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab, startToken);
  }, [tab, startToken, load]);

  const goNext = () => {
    if (!nextPage) return;
    setCursorStack((s) => [...s, nextPage]);
  };

  const goPrev = () => {
    if (cursorStack.length <= 1) return;
    setCursorStack((s) => s.slice(0, -1));
  };

  return (
    <section
      id="news"
      className="relative z-10 scroll-mt-40 px-4 py-20 md:scroll-mt-44 md:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-cyan-300/80">
              Live wire
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[#EAEAEA] md:text-4xl">
              Real-time <span className="tg-gradient-text">headlines</span>
            </h2>
            <p className="mt-3 max-w-xl text-[#EAEAEA]/65">
              Up to ~22 stories per page per category. Use Next / Previous to move
              through the feed without endless scrolling.
            </p>
          </div>
        </motion.div>

        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setCursorStack([undefined]);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === t.id
                  ? "bg-gradient-to-r from-cyan-500/30 to-fuchsia-500/25 text-cyan-50 ring-1 ring-cyan-400/50"
                  : "bg-white/5 text-[#EAEAEA]/65 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {loading ? (
          <NewsSkeleton count={6} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((a, i) => (
              <NewsCard
                key={a.article_id || `${a.link}-${i}`}
                article={a}
                index={i}
                onOpen={setSelected}
              />
            ))}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={goPrev}
              disabled={cursorStack.length <= 1}
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-[#EAEAEA] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
            >
              ← Previous
            </button>
            <span className="text-xs text-[#EAEAEA]/45">
              Page {cursorStack.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={!nextPage}
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-6 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Next →
            </button>
          </div>
        )}

        <NewsModal article={selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
}
