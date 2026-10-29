import Link from "next/link";
import { SITE } from "@/lib/site";

// The three tools, in the same order as on the home page.
const TOOLS = [
  ["/ai-readiness", "AI Readiness Assessment"],
  ["/financing-codebook", "Financing Codebook"],
  ["/policy-codebook", "Policy Codebook"],
];

/** Navy footer with link columns, in the style of Duke websites. */
export default function SiteFooter() {
  return (
    <footer className="mt-24 bg-brand-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-8 pt-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-2xl font-medium">{SITE.name}</p>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">
            {SITE.about}
          </p>
          <ul className="mt-3 space-y-1 text-[15px]">
            {[
              [SITE.dukeUrl, "Duke Global Health Innovation Center"],
              [SITE.orgUrl, SITE.org],
            ].map(([href, label]) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/90 hover:text-white hover:underline"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Tools">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">
            Tools
          </p>
          <ul className="mt-3 space-y-2 text-[15px]">
            {TOOLS.map(([href, label]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-white/90 hover:text-white hover:underline"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">
            About
          </p>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link
                href="/about"
                className="text-white/90 hover:text-white hover:underline"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/framework"
                className="text-white/90 hover:text-white hover:underline"
              >
                The Framework
              </Link>
            </li>
            <li>
              <Link
                href="/data-use"
                className="text-white/90 hover:text-white hover:underline"
              >
                How We Use Your Data
              </Link>
            </li>
            {SITE.contactEmail && (
              <li>
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="text-white/90 hover:text-white hover:underline"
                >
                  Contact Us
                </a>
              </li>
            )}
            <li>
              <Link
                href="/about#acknowledgments"
                className="text-white/90 hover:text-white hover:underline"
              >
                Acknowledgments and Credits
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/20 py-4 text-[13px] text-white/70">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Results are a decision
            aid, not a certification or ranking.
          </p>
        </div>
      </div>
    </footer>
  );
}
