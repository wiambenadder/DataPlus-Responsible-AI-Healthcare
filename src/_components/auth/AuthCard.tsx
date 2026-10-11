import Link from "next/link";
import type { ReactNode } from "react";
import Photo from "@/components/Photo";
import { SITE } from "@/lib/site";

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** A second, outlined full-width action under the form (e.g. "Create an Account"). */
  secondary?: { href: string; label: string; lead?: string };
  /** Anything else under the card's divider. */
  footer?: ReactNode;
};

/**
 * Log in / create account layout: a photo with a short statement beside
 * the form, then a note about who the platform is for. Open to anyone —
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
    <div className="grid lg:min-h-[640px] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <Photo name="innovators" width={1400} priority />
        <div className="absolute inset-x-0 bottom-0 bg-brand-navy/90 px-10 py-8 text-white">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-blue-200">{SITE.org}</p>
          <p className="mt-2 max-w-md font-serif text-[1.75rem] leading-snug">
            See how ready your AI tool is for real-world care, with the evidence behind every
            rating.
          </p>
        </div>
      </div>

      <div className="bg-whisper px-4 py-12 sm:py-16">
        <section
          aria-labelledby="auth-title"
          className="mx-auto w-full max-w-[28rem] border border-slate-200 border-t-4 border-t-brand-navy bg-white px-7 py-9 sm:px-10"
        >
          <p className="label-caps">{SITE.name}</p>
          <h1 id="auth-title" className="mt-2 text-[2.25rem]">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{subtitle}</p>
          ) : null}

          <div className="mt-7">{children}</div>

          {secondary ? (
            <div className="mt-5 border-t border-slate-200 pt-5">
              {secondary.lead ? <p className="mb-2 text-sm text-slate-600">{secondary.lead}</p> : null}
              <Link href={secondary.href} className="btn btn-secondary w-full">
                {secondary.label}
              </Link>
            </div>
          ) : null}

          {footer ? (
            <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">{footer}</div>
          ) : null}
        </section>

        <aside className="mx-auto mt-6 w-full max-w-[28rem] text-[14px] leading-relaxed text-slate-700">
          <p className="font-bold text-ink">About This Platform</p>
          <p className="mt-1">
            {SITE.name} is open to anyone building or deploying an AI tool for health. You can
            create an account with any email address. Your documents and answers are only
            visible to your own team and the platform team.{" "}
            <Link href="/data-use" className="link-more">
              How we use your data
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
