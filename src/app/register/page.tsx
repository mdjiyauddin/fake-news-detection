"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function strengthScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return s; // 0..5
}

function strengthLabel(score: number) {
  if (score <= 2) return { label: "Weak", color: "bg-rose-500" };
  if (score <= 4) return { label: "Medium", color: "bg-amber-500" };
  return { label: "Strong", color: "bg-emerald-500" };
}

function Shell({
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,212,255,0.20),transparent_46%),radial-gradient(circle_at_78%_22%,rgba(138,43,226,0.16),transparent_48%),radial-gradient(circle_at_45%_85%,rgba(255,51,102,0.14),transparent_55%)]" />
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
            <p className="font-[family-name:var(--font-orbitron)] text-xs uppercase tracking-[0.35em] text-fuchsia-300/80">
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

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);

  const pwScore = useMemo(() => strengthScore(password), [password]);
  const pwMeta = useMemo(() => strengthLabel(pwScore), [pwScore]);
  const pwPct = useMemo(() => Math.round((pwScore / 5) * 100), [pwScore]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) return setError("Name must be at least 2 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Please provide a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const j = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !j.success) {
        setError(j.error || "Registration failed.");
        return;
      }
      router.replace("/login?success=" + encodeURIComponent("Account created. Please login."));
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell title="Register" subtitle="Create a demo account (stored locally in JSON).">
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/70">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Your name"
            className="mt-1 w-full rounded-xl border border-fuchsia-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-fuchsia-400/50"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/70">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@college.edu"
            className="mt-1 w-full rounded-xl border border-fuchsia-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-fuchsia-400/50"
            required
          />
        </div>

        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/70">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="Min 8 characters"
            className="mt-1 w-full rounded-xl border border-fuchsia-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-fuchsia-400/50"
            required
          />
          <div className="mt-2">
            <div className="flex items-center justify-between text-[11px] text-[#EAEAEA]/55">
              <span>Password strength</span>
              <span className="font-semibold text-[#EAEAEA]/75">{pwMeta.label}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full ${pwMeta.color} transition-all`}
                style={{ width: `${pwPct}%` }}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[#EAEAEA]/70">Confirm password</label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            className="mt-1 w-full rounded-xl border border-fuchsia-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-fuchsia-400/50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 px-4 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,51,102,0.22)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-[#EAEAEA]/60">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-semibold text-cyan-200 underline-offset-4 hover:underline"
        >
          Login
        </button>
      </div>
    </Shell>
  );
}

