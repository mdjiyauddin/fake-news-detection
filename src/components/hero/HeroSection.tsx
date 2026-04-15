"use client";

import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FloatingHeadlines } from "./FloatingHeadlines";
import { scrollToSection } from "@/utils/scrollToSection";

const GlobeCanvas = dynamic(
  () => import("./GlobeCanvas").then((m) => m.GlobeCanvas),
  { ssr: false, loading: () => <div className="h-[420px] animate-pulse rounded-3xl bg-white/5" /> }
);

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/news?category=world");
        const j = (await res.json()) as {
          results?: { title?: string }[];
        };
        if (cancelled || !j.results) return;
        setHeadlines(
          j.results
            .map((r) => r.title)
            .filter(Boolean)
            .slice(0, 6) as string[]
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      ref={ref}
      id="top"
      className="relative z-10 flex min-h-screen flex-col justify-center overflow-hidden px-4 pb-24 pt-36 md:px-8 md:pt-44"
    >
      <div className="tg-grid-bg pointer-events-none absolute inset-0 opacity-70" />

      <motion.div style={{ y, opacity }} className="relative mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="relative">
          <FloatingHeadlines lines={headlines} />
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="font-[family-name:var(--font-orbitron)] text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/90"
          >
            Neural news mesh
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.7 }}
            className="mt-4 font-[family-name:var(--font-orbitron)] text-4xl font-black leading-tight tracking-tight text-[#EAEAEA] md:text-5xl lg:text-6xl"
          >
            AI Powered{" "}
            <span className="tg-gradient-text">Fake News Detection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 max-w-xl text-lg text-[#EAEAEA]/75"
          >
            Live headlines, multi-crypto telemetry, global sports, and heuristic
            checks for misinformation — in one immersive command surface.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="mt-4 font-[family-name:var(--font-orbitron)] text-sm font-bold uppercase tracking-[0.28em] text-fuchsia-400/90"
          >
            Detect Truth. Stay Ahead.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              type="button"
              onClick={() => scrollToSection("news")}
              className="rounded-xl border border-cyan-400/35 bg-cyan-400/10 px-6 py-3 text-sm font-semibold text-cyan-100 shadow-[0_0_24px_rgba(0,240,255,0.2)] transition hover:bg-cyan-400/20"
            >
              Enter the feed
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("truth-ai")}
              className="rounded-xl border border-fuchsia-500/30 bg-fuchsia-500/10 px-6 py-3 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20"
            >
              Run Truth AI
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="tg-glow-border relative rounded-3xl"
        >
          <div className="tg-glass relative overflow-hidden rounded-3xl p-2">
            <GlobeCanvas />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
