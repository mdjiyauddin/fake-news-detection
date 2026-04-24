"use client";

import { motion } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function GlassAuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-[#EAEAEA]">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(0,212,255,0.20),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,51,102,0.14),transparent_46%),radial-gradient(circle_at_50%_80%,rgba(138,43,226,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_0_1px_rgba(0,212,255,0.08),0_20px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-8"
        >
          <div className="mb-6">
            <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.35em] text-cyan-300/80">
              TruthGuard
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-orbitron)] text-2xl font-black">
              {title}
            </h1>
            <p className="mt-2 text-sm text-[#EAEAEA]/60">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [from, setFrom] = useState<string>("/");
  const [authError, setAuthError] = useState<string | null>(null);

  const prettyAuthError = useMemo(() => {
    if (!authError) return null;
    if (authError === "CredentialsSignin") return "Invalid email or password.";
    return "Login failed. Please try again.";
  }, [authError]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setSuccessMsg(sp.get("success"));
    setFrom(sp.get("from") || "/");
    setAuthError(sp.get("error"));
  }, []);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);

  useEffect(() => {
    if (prettyAuthError) setError(prettyAuthError);
  }, [prettyAuthError]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res || res.error) {
        setError("Invalid email or password.");
        return;
      }

      // "remember me" is purely UX here since JWT sessions are cookie-based;
      // still keep the checkbox for demo realism.
      void remember;
      router.replace(from);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassAuthShell
      title="Login"
      subtitle="Access your TruthGuard dashboard and live news scanner."
    >
      {successMsg && (
        <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/70">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            className="mt-1 w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/70">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
            required
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#EAEAEA]/60">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-black/40 text-cyan-400 accent-cyan-400"
            />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => router.push("/forgot-password")}
            className="text-xs text-cyan-300/80 underline-offset-4 hover:text-cyan-200 hover:underline"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(0,212,255,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#EAEAEA]/60">
        New here?{" "}
        <button
          type="button"
          onClick={() => router.push("/register")}
          className="font-semibold text-cyan-200 underline-offset-4 hover:underline"
        >
          Create an account
        </button>
      </div>
    </GlassAuthShell>
  );
}

