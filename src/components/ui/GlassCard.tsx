"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import clsx from "clsx";

export function GlassCard({
  children,
  className,
  tilt = true,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  return (
    <motion.div
      className={clsx("tg-glass rounded-2xl p-5", className)}
      whileHover={
        tilt
          ? {
              rotateX: 4,
              rotateY: -4,
              scale: 1.01,
              transition: { type: "spring", stiffness: 260, damping: 22 },
            }
          : undefined
      }
      style={{ transformStyle: "preserve-3d", perspective: 900 }}
    >
      {children}
    </motion.div>
  );
}
