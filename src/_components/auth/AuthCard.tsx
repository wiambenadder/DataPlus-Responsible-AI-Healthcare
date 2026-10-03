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
    <div className="flex min-h-[calc(100vh-56px)] items-start justify-center bg-slate-50 px-4 py-10 sm:items-center sm:py-16">
      <section
        aria-labelledby="auth-title"
        className="w-full max-w-md border border-t-4 border-slate-200 border-t-blue-600 bg-white p-7 sm:p-9"
      >
        <p className="font-serif text-lg font-semibold text-blue-600">
          Innovator Insights
        </p>

        <h1
          id="auth-title"
          className="mt-5 text-2xl font-semibold text-slate-900"
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
    </div>
  );
}
