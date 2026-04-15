"use client";

import { motion } from "framer-motion";
import { scrollToSection } from "@/utils/scrollToSection";
import { CyberTicker } from "./CyberTicker";

const links = [
  { id: "news", label: "Live News" },
  { id: "crypto", label: "Crypto" },
  { id: "sports", label: "Sports" },
  { id: "truth-ai", label: "Truth AI" },
  { id: "media", label: "Media Lab" },
  { id: "assistant", label: "Assistant" },
];

export function Navbar() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed left-0 right-0 top-0 z-50"
    >
      <div className="px-4 pt-3 md:px-8 md:pt-4">
        <nav className="tg-glass mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-3 md:px-6">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("top");
            }}
            className="font-[family-name:var(--font-orbitron)] text-sm font-bold tracking-tight md:text-base"
          >
            <span className="tg-gradient-text">AI Powered</span>
            <span className="text-[#EAEAEA]/90"> Fake News Detection</span>
          </a>
          <ul className="hidden flex-wrap items-center justify-end gap-1 text-xs font-medium text-[#EAEAEA]/80 md:flex md:gap-3 md:text-sm">
            {links.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => scrollToSection(l.id)}
                  className="rounded-lg px-2 py-1 transition-colors hover:bg-white/5 hover:text-cyan-300"
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <CyberTicker />
    </motion.header>
  );
}
