"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

type Result = {
  verdict: "REAL" | "MISLEADING" | "FAKE" | "ERROR";
  confidenceScore: number;
  breakdown?: {
    credibility: number;
    sensationalism: number;
    emotional: number;
    consistency: number;
  };
  flags?: string[];
  explanation: string;
};

function ScoreBar({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs text-[#EAEAEA]/65">
        <span>{label}</span>
        <span className="font-semibold text-[#EAEAEA]">{value}%</span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, value)}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${colorClass}`}
        />
      </div>
    </div>
  );
}

export function FakeNewsTool() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/fake-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, url }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Analysis failed");
      setResult(j);
    } catch (e) {
      setResult({
        verdict: "ERROR",
        confidenceScore: 0,
        explanation: e instanceof Error ? e.message : "Request failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const fake = result?.verdict === "FAKE";
  const real = result?.verdict === "REAL";

  return (
    <section
      id="truth-ai"
      className="relative z-10 scroll-mt-40 px-4 py-16 md:scroll-mt-44 md:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center md:text-left"
        >
          <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-cyan-300/80">
            Truth engine
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-orbitron)] text-3xl font-bold text-[#EAEAEA] md:text-4xl">
            Misinformation <span className="tg-gradient-text">radar</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#EAEAEA]/60 md:mx-0">
            Smart rule-based scoring with explainable signals (demo — not a certified
            classifier).
          </p>
        </motion.div>

        <GlassCard className="tg-glow-border !rounded-3xl">
          <label className="block text-sm font-medium text-[#EAEAEA]/75">
            News text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste headline or paragraph…"
            className="mt-2 w-full resize-y rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none ring-0 placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
          />
          <label className="mt-4 block text-sm font-medium text-[#EAEAEA]/75">
            Source URL (optional)
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className="mt-2 w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
          />
          <div className="mt-6 flex justify-center md:justify-start">
            <MagneticButton
              type="button"
              disabled={loading}
              onClick={analyze}
            >
              {loading ? "Scanning…" : "Run full scan"}
            </MagneticButton>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.verdict + result.confidenceScore}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-8 space-y-6 rounded-2xl border border-white/10 bg-black/35 p-6"
              >
                <div className="flex flex-wrap items-center gap-4">
                  <div
                    className={`font-[family-name:var(--font-orbitron)] text-2xl font-black ${
                      fake
                        ? "text-fuchsia-400"
                        : real
                          ? "text-emerald-400"
                          : "text-amber-300"
                    }`}
                  >
                    {result.verdict === "ERROR" ? "ERROR" : result.verdict}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-fuchsia-500/25 bg-fuchsia-500/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-fuchsia-300/80">
                      Sensationalism
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-orbitron)] text-3xl font-bold text-fuchsia-200">
                      {result.breakdown ? result.breakdown.sensationalism : 0}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                    <p className="text-xs uppercase tracking-widest text-emerald-300/80">
                      Credibility
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-orbitron)] text-3xl font-bold text-emerald-200">
                      {result.breakdown ? result.breakdown.credibility : 0}%
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <ScoreBar
                    label="Confidence (more likely real)"
                    value={result.confidenceScore ?? 0}
                    colorClass="bg-gradient-to-r from-cyan-500 to-emerald-500"
                  />
                  <ScoreBar
                    label="Emotional manipulation"
                    value={result.breakdown ? result.breakdown.emotional : 0}
                    colorClass="bg-gradient-to-r from-amber-500 to-rose-500"
                  />
                  <ScoreBar
                    label="Consistency"
                    value={result.breakdown ? result.breakdown.consistency : 0}
                    colorClass="bg-gradient-to-r from-violet-600 to-fuchsia-500"
                  />
                </div>

                <p className="text-sm leading-relaxed text-[#EAEAEA]/75">
                  {result.explanation}
                </p>
                {result.flags && result.flags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.flags.slice(0, 8).map((f) => (
                      <span
                        key={f}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[#EAEAEA]/70"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </div>
    </section>
  );
}
