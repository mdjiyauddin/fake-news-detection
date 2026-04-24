"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(0,212,255,0.18),transparent_46%),radial-gradient(circle_at_75%_25%,rgba(255,51,102,0.14),transparent_48%),radial-gradient(circle_at_55%_85%,rgba(138,43,226,0.14),transparent_55%)]" />
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { status } = useSession();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [router, status]);

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const em = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      setError("Please provide a valid email address.");
      return;
    }

    // Demo: we verify by attempting a reset with a dummy short password to avoid leaking
    // existence via a special endpoint. Here we instead move to step 2 and validate server-side.
    setStep(2);
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          newPassword,
          confirmPassword,
        }),
      });
      const j = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !j.success) {
        setError(j.error || "Reset failed.");
        return;
      }
      setSuccess("Password updated. You can now login.");
      setTimeout(() => router.replace("/login?success=" + encodeURIComponent("Password updated. Please login.")), 700);
    } catch {
      setError("Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell
      title="Forgot password"
      subtitle="For the college demo, you can reset directly (no email required)."
    >
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={verifyEmail} className="space-y-4">
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
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 text-sm font-bold text-black transition hover:brightness-110"
          >
            Continue
          </button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-[#EAEAEA]/70">
            Resetting password for <span className="font-semibold text-cyan-200">{email.trim()}</span>
          </div>
          <div>
            <label className="text-xs font-medium text-[#EAEAEA]/70">New password</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Min 8 characters"
              className="mt-1 w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[#EAEAEA]/70">Confirm password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              className="mt-1 w-full rounded-xl border border-cyan-400/20 bg-black/40 px-4 py-3 text-sm text-[#EAEAEA] outline-none placeholder:text-[#EAEAEA]/30 focus:border-cyan-400/50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Resetting…" : "Reset password"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setNewPassword("");
              setConfirmPassword("");
              setError(null);
            }}
            className="w-full text-center text-xs text-[#EAEAEA]/55 underline-offset-4 hover:text-[#EAEAEA] hover:underline"
          >
            Back
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm text-[#EAEAEA]/60">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="font-semibold text-cyan-200 underline-offset-4 hover:underline"
        >
          Back to login
        </button>
      </div>
    </Shell>
  );
}

