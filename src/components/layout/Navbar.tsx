"use client";

import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const { data } = useSession();
  const router = useRouter();
  const user = data?.user;
  const initials =
    user?.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "U";

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
            <li className="ml-2 flex items-center gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-cyan-400/40 via-purple-400/35 to-fuchsia-400/40 text-xs font-bold text-[#EAEAEA]">
                      {initials}
                    </span>
                    <span className="max-w-[140px] truncate text-xs text-[#EAEAEA]/75">
                      {user.name || user.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
                >
                  Login
                </button>
              )}
            </li>
          </ul>

          <div className="flex items-center gap-2 md:hidden">
            {user ? (
              <>
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-xs font-bold text-[#EAEAEA]">
                  {initials}
                </span>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
              >
                Login
              </button>
            )}
          </div>
        </nav>
      </div>
      <CyberTicker />
    </motion.header>
  );
}
