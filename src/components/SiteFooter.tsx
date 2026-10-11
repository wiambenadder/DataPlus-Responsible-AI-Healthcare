import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { SITE } from "@/lib/site";

/** Navy footer with link columns, in the style of the DGHI site. */
export default function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-2xl font-semibold">{SITE.name}</p>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/80">{SITE.about}</p>
        </div>

        <nav aria-label="Platform">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">Platform</p>
          <ul className="mt-3 space-y-2 text-[15px]">
            {[
              ["/", "Home"],
              ["/report/assessment", "Submit evidence"],
              ["/dashboard", "Dashboard"],
              ["/roadmap", "Roadmap"],
              ["/hub", "All tools"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-white/90 hover:text-white hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Help">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/60">Help</p>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/framework" className="text-white/90 hover:text-white hover:underline">
                The framework explained
              </Link>
            </li>
            <li>
              <Link href="/data-use" className="text-white/90 hover:text-white hover:underline">
                How we use your data
              </Link>
            </li>
            {SITE.contactEmail && (
              <li>
                <a href={`mailto:${SITE.contactEmail}`} className="text-white/90 hover:text-white hover:underline">
                  Contact us
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-[13px] text-white/70 sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Results are a decision aid, not a
            certification or ranking.
          </p>
          <a href="#top" className="inline-flex items-center gap-1 hover:text-white hover:underline">
            Back to top
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </footer>
  );
}
