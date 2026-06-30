"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthCard from "@/_components/auth/AuthCard";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function login() {
    if (loading) return;

    setError(null);
    setLoading(true);

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setError("No user was returned after sign in.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (!profile) {
      router.push("/company-setup");
      return;
    }

    router.push("/");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!loading) login();
  }

  const inputClass =
    "h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-900 placeholder:text-slate-400 transition hover:border-slate-400 focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/20";

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to access your organization's assessments, reports, and insights."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            href="/redesign/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
          >
            <svg
              className="mt-0.5 shrink-0"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5" />
              <path d="M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-slate-900"
          >
            Email
          </label>
          <input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@organization.org"
            value={email}
            aria-invalid={!!error}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-password"
            className="text-sm font-semibold text-slate-900"
          >
            Password
          </label>
          <div className="relative flex items-center">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              aria-invalid={!!error}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-1.5 grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {showPassword ? (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
                  <path d="M9.9 4.6A10 10 0 0 1 12 4.5c6.5 0 10 7 10 7a18 18 0 0 1-3 3.8" />
                  <path d="M6.1 6.1A18 18 0 0 0 2 11.5s3.5 7 10 7a10 10 0 0 0 3.1-.5" />
                </svg>
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 text-[15px] font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/30 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </AuthCard>
  );
}
