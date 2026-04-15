"use client";

import { motion } from "framer-motion";
import type { NewsArticle } from "@/lib/types";

type Props = {
  article: NewsArticle;
  onOpen: (a: NewsArticle) => void;
  index: number;
};

export function NewsCard({ article, onOpen, index }: Props) {
  const img = article.image_url;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.45 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group tg-glass cursor-pointer overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(0,240,255,0.08)] transition-shadow hover:shadow-[0_0_40px_rgba(138,43,226,0.25)]"
      onClick={() => onOpen(article)}
    >
      <div className="relative h-44 overflow-hidden bg-black/40">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={img}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-fuchsia-500/10 text-xs text-[#EAEAEA]/40">
            TruthGuard
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-90" />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold leading-snug text-[#EAEAEA]">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-[#EAEAEA]/55">
          {article.description || article.content || "Open for full briefing."}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-cyan-300/70">
          {article.pubDate?.slice(0, 16) || "—"}
        </p>
      </div>
    </motion.article>
  );
}
