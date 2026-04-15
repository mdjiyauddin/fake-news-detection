"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";
import clsx from "clsx";

type Props = {
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
};

export function MagneticButton({
  children,
  className,
  type = "button",
  disabled,
  onClick,
}: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 });

  const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  };

  const leave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      onMouseMove={handle}
      onMouseLeave={leave}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        "relative overflow-hidden rounded-xl px-6 py-3 font-semibold tracking-wide",
        "bg-gradient-to-r from-cyan-400/20 via-fuchsia-500/15 to-violet-600/25",
        "text-[#EAEAEA] shadow-[0_0_24px_rgba(0,240,255,0.25)]",
        "ring-1 ring-cyan-400/40 transition-shadow hover:shadow-[0_0_36px_rgba(255,0,127,0.35)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
      <span
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "linear-gradient(120deg, transparent, rgba(0,240,255,0.15), transparent)",
        }}
      />
    </motion.button>
  );
}
