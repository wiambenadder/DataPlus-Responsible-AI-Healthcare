"use client";

import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: AuthCardProps) {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-start justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 sm:items-center sm:py-16">
      <section
        aria-labelledby="auth-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_40px_-20px_rgba(15,23,42,0.25)] sm:p-9"
      >
        <div className="mb-7 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-[13px] font-bold tracking-wide text-white shadow-md shadow-blue-600/25"
          >
            IiH
          </span>
          <span className="text-[15px] font-semibold text-slate-900">
            Innovator Insights
          </span>
        </div>

        <h1
          id="auth-title"
          className="text-2xl font-bold tracking-tight text-slate-900"
        >
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-7">{children}</div>

        {footer ? (
          <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
            {footer}
          </div>
        ) : null}
      </section>
    </main>
  );
}
