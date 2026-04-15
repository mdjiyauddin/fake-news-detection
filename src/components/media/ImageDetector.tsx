"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MagneticButton } from "@/components/ui/MagneticButton";

export function ImageDetector() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<{
    aiProbability: number;
    label: string;
    confidence: number;
    note?: string;
    source?: string;
  } | null>(null);

  const runFile = async () => {
    if (!file) return;
    setLoading(true);
    setOut(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/image-detect", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setOut(j);
    } catch (e) {
      setOut({
        aiProbability: 0,
        label: "Error",
        confidence: 0,
        note: e instanceof Error ? e.message : "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const runUrl = async () => {
    const u = url.trim();
    if (!u) return;
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/image-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setOut(j);
    } catch (e) {
      setOut({
        aiProbability: 0,
        label: "Error",
        confidence: 0,
        note: e instanceof Error ? e.message : "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="media"
      className="relative z-10 scroll-mt-40 px-4 py-12 md:scroll-mt-44 md:px-8"
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-fuchsia-300/80">
            Media lab · Image
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-orbitron)] text-2xl font-bold text-[#EAEAEA]">
            AI image <span className="tg-gradient-text">signal</span>
          </h3>
          <p className="mt-2 text-sm text-[#EAEAEA]/55">
            Upload a file or paste a direct image URL (jpg/png/webp). Demo entropy
            scoring — not a vision model.
          </p>
          <GlassCard className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-medium text-[#EAEAEA]/60">
                Image link
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="mt-1 w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-2.5 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
              />
              <div className="mt-2">
                <MagneticButton
                  type="button"
                  disabled={!url.trim() || loading}
                  onClick={runUrl}
                >
                  {loading ? "Fetching…" : "Analyze from URL"}
                </MagneticButton>
              </div>
            </div>
            <p className="text-center text-xs text-[#EAEAEA]/35">or</p>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setOut(null);
                }}
                className="w-full text-sm text-[#EAEAEA]/80 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-cyan-100"
              />
              <div className="mt-2">
                <MagneticButton
                  type="button"
                  disabled={!file || loading}
                  onClick={runFile}
                >
                  {loading ? "Scanning…" : "Analyze upload"}
                </MagneticButton>
              </div>
            </div>
            {out && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm"
              >
                <p className="font-semibold text-cyan-200">{out.label}</p>
                <p className="mt-2 text-[#EAEAEA]/75">
                  AI-like score:{" "}
                  <span className="text-fuchsia-300">{out.aiProbability}%</span> ·
                  Confidence (demo):{" "}
                  <span className="text-cyan-300">{out.confidence}%</span>
                </p>
                {out.source && (
                  <p className="mt-1 text-xs text-[#EAEAEA]/50">Source: {out.source}</p>
                )}
                {out.note && (
                  <p className="mt-2 text-xs text-[#EAEAEA]/45">{out.note}</p>
                )}
              </motion.div>
            )}
          </GlassCard>
        </motion.div>
        <VideoDetectorPanel />
      </div>
    </section>
  );
}

function VideoDetectorPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState<{
    deepfakeProbability: number;
    label: string;
    framesAnalyzed: number;
    note?: string;
    source?: string;
  } | null>(null);

  const runFile = async () => {
    if (!file) return;
    setLoading(true);
    setOut(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/video-detect", { method: "POST", body: fd });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setOut(j);
    } catch (e) {
      setOut({
        deepfakeProbability: 0,
        label: "Error",
        framesAnalyzed: 0,
        note: e instanceof Error ? e.message : "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  const runUrl = async () => {
    const u = url.trim();
    if (!u) return;
    setLoading(true);
    setOut(null);
    try {
      const res = await fetch("/api/video-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: u }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed");
      setOut(j);
    } catch (e) {
      setOut({
        deepfakeProbability: 0,
        label: "Error",
        framesAnalyzed: 0,
        note: e instanceof Error ? e.message : "Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.3em] text-cyan-300/80">
        Media lab · Video
      </p>
      <h3 className="mt-2 font-[family-name:var(--font-orbitron)] text-2xl font-bold text-[#EAEAEA]">
        Deepfake <span className="tg-gradient-text">preview</span>
      </h3>
      <p className="mt-2 text-sm text-[#EAEAEA]/55">
        Paste a direct .mp4 link (small files work best) or upload. Demo only —
        not real frame analysis.
      </p>
      <GlassCard className="mt-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/60">Video link</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/clip.mp4"
            className="mt-1 w-full rounded-xl border border-fuchsia-400/20 bg-black/40 px-4 py-2.5 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-fuchsia-400/50"
          />
          <div className="mt-2">
            <MagneticButton
              type="button"
              disabled={!url.trim() || loading}
              onClick={runUrl}
            >
              {loading ? "Fetching…" : "Analyze from URL"}
            </MagneticButton>
          </div>
        </div>
        <p className="text-center text-xs text-[#EAEAEA]/35">or</p>
        <div>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setOut(null);
            }}
            className="w-full text-sm text-[#EAEAEA]/80 file:mr-4 file:rounded-lg file:border-0 file:bg-fuchsia-500/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-fuchsia-100"
          />
          <div className="mt-2">
            <MagneticButton
              type="button"
              disabled={!file || loading}
              onClick={runFile}
            >
              {loading ? "Sampling…" : "Analyze upload"}
            </MagneticButton>
          </div>
        </div>
        {out && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm"
          >
            <p className="font-semibold text-fuchsia-200">{out.label}</p>
            <p className="mt-2 text-[#EAEAEA]/75">
              Synthetic probability (demo):{" "}
              <span className="text-cyan-300">{out.deepfakeProbability}%</span>
            </p>
            <p className="mt-1 text-xs text-[#EAEAEA]/50">
              Frames referenced (simulated): {out.framesAnalyzed}
            </p>
            {out.source && (
              <p className="mt-1 text-xs text-[#EAEAEA]/50">Source: {out.source}</p>
            )}
            {out.note && (
              <p className="mt-2 text-xs text-[#EAEAEA]/45">{out.note}</p>
            )}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}
