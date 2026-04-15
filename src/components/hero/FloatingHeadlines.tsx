"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type Props = { lines: string[] };

export function FloatingHeadlines({ lines }: Props) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (lines.length <= 1) return;
    const t = setInterval(() => setI((v) => (v + 1) % lines.length), 4200);
    return () => clearInterval(t);
  }, [lines.length]);

  const text = lines[i] || "Live wire: calibrating global headlines…";

  return (
    <div className="pointer-events-none absolute left-[8%] top-[22%] hidden max-w-[min(340px,32vw)] lg:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.55 }}
          className="rounded-2xl border border-cyan-400/20 bg-black/35 px-4 py-3 text-xs text-[#EAEAEA]/85 shadow-[0_0_30px_rgba(0,240,255,0.12)] backdrop-blur-md"
        >
          <p className="font-[family-name:var(--font-orbitron)] text-[10px] uppercase tracking-[0.2em] text-cyan-300/90">
            Live pulse
          </p>
          <p className="mt-2 line-clamp-3 leading-relaxed">{text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
