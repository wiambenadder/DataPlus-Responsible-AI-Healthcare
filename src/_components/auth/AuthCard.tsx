import Link from "next/link";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { SITE } from "@/lib/site";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** A second, outlined full-width action under the form (e.g. "Create an account"). */
  secondary?: { href: string; label: string; lead?: string };
  /** Anything else under the card's divider. */
  footer?: ReactNode;
};

/**
 * Sign-in / sign-up layout: a centred card with the wordmark, the form and
 * a second action, then an information panel underneath. Open to anyone —
 * no institutional single sign-on.
 */
export default function AuthCard({
  title,
  subtitle,
  children,
  secondary,
  footer,
}: AuthCardProps) {
  return (
    <div className="bg-slate-50 px-4 py-12 sm:py-16">
      <section
        aria-labelledby="auth-title"
        className="mx-auto w-full max-w-[26rem] rounded-md border border-slate-200 bg-white px-7 py-9 shadow-md sm:px-10"
      >
        <p className="text-center font-serif text-[30px] font-semibold leading-none text-brand-navy">
          {SITE.name}
        </p>

        <h1
          id="auth-title"
          className="mt-6 text-center font-sans text-xl font-semibold text-slate-900"
          style={{ fontFamily: "var(--font-sans)", letterSpacing: 0 }}
        >
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-2 text-center text-[15px] leading-relaxed text-slate-600">{subtitle}</p>
        ) : null}

        <div className="mt-7">{children}</div>

        {secondary ? (
          <div className="mt-4">
            {secondary.lead ? (
              <p className="mb-2 text-center text-sm text-slate-600">{secondary.lead}</p>
            ) : null}
            <Link
              href={secondary.href}
              className="flex h-12 w-full items-center justify-center rounded-md border border-slate-300 text-[15px] font-semibold text-slate-900 hover:border-brand-navy hover:text-brand-navy"
            >
              {secondary.label}
            </Link>
          </div>
        ) : null}

        {footer ? (
          <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">{footer}</div>
        ) : null}
      </section>

      <aside className="mx-auto mt-6 w-full max-w-[26rem] rounded-md bg-slate-100 px-6 py-5 text-[14px] leading-relaxed text-slate-700 sm:px-8">
        <p className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Info className="h-5 w-5 shrink-0" aria-hidden />
          About this platform
        </p>
        <p className="mt-2">
          {SITE.name} is open to anyone building or deploying an AI tool for health.
          You can create an account with any email address.
        </p>
        <p className="mt-2">
          Your documents and answers are only visible to your own team and the
          platform team. Read{" "}
          <Link href="/data-use" className="font-semibold text-brand-dukeblue underline underline-offset-2">
            how we use your data
          </Link>{" "}
          and{" "}
          <Link href="/framework" className="font-semibold text-brand-dukeblue underline underline-offset-2">
            how the assessment works
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}
