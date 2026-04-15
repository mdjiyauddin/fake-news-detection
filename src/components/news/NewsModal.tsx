"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { NewsArticle } from "@/lib/types";

type Props = {
  article: NewsArticle | null;
  onClose: () => void;
};

export function NewsModal({ article, onClose }: Props) {
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
