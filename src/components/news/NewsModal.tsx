"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { NewsArticle } from "@/lib/types";
import { detectNews } from "@/lib/detectNews";

type Props = {
  article: NewsArticle | null;
  onClose: () => void;
};

function Meter({
  label,
  value,
  gradient,
}: {
  label: string;
  value: number;
  gradient: string;
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
          transition={{ duration: 0.55, ease: "easeOut" }}
          className={`h-full rounded-full ${gradient}`}
        />
      </div>
    </div>
  );
}

export function NewsModal({ article, onClose }: Props) {
  const detection = article
    ? detectNews({
        title: article.title,
        description: article.description || undefined,
        content: article.content || undefined,
        source_id: article.source_id || undefined,
        pubDate: article.pubDate || undefined,
        link: article.link || undefined,
      })
    : null;

  const verdictColor =
    detection?.verdict === "REAL"
      ? "text-emerald-300"
      : detection?.verdict === "FAKE"
        ? "text-fuchsia-300"
        : "text-amber-300";

  return (
    <AnimatePresence>
      {article && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            aria-label="Close"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            className="tg-glow-border relative z-10 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl"
          >
            <div className="tg-glass max-h-[85vh] overflow-y-auto rounded-3xl p-6 md:p-8">
              {article.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={article.image_url}
                  alt=""
                  loading="lazy"
                  className="mb-6 max-h-56 w-full rounded-xl object-cover"
                />
              )}
              <h2 className="font-[family-name:var(--font-orbitron)] text-xl font-bold text-[#EAEAEA] md:text-2xl">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-cyan-300/80">{article.pubDate}</p>

              {detection && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p
                        className={`font-[family-name:var(--font-orbitron)] text-lg font-black ${verdictColor}`}
                      >
                        {detection.verdict}
                      </p>
                      <span className="text-xs text-[#EAEAEA]/50">
                        Confidence:{" "}
                        <span className="font-semibold text-cyan-200">
                          {detection.confidenceScore}%
                        </span>
                      </span>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[#EAEAEA]/60">
                      Smart scan
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Meter
                      label="Credibility"
                      value={detection.breakdown.credibility}
                      gradient="bg-gradient-to-r from-emerald-500 to-cyan-500"
                    />
                    <Meter
                      label="Sensationalism"
                      value={detection.breakdown.sensationalism}
                      gradient="bg-gradient-to-r from-fuchsia-500 to-violet-600"
                    />
                    <Meter
                      label="Emotional manipulation"
                      value={detection.breakdown.emotional}
                      gradient="bg-gradient-to-r from-amber-500 to-rose-500"
                    />
                    <Meter
                      label="Consistency"
                      value={detection.breakdown.consistency}
                      gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
                    />
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#EAEAEA]/75">
                    {detection.explanation}
                  </p>

                  {detection.flags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {detection.flags.slice(0, 8).map((f) => (
                        <span
                          key={f}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-[#EAEAEA]/70"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <p className="mt-6 whitespace-pre-wrap text-[#EAEAEA]/80">
                {article.description ||
                  article.content ||
                  "No description available for this wire."}
              </p>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-5 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Open original source
              </a>
              <button
                type="button"
                onClick={onClose}
                className="ml-4 text-sm text-[#EAEAEA]/50 underline-offset-4 hover:text-[#EAEAEA] hover:underline"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
