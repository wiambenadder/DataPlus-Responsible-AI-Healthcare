"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ExternalLink, FileSearch, Globe2, Info } from "lucide-react";

const links = [
  { href: "/policy-codebook", label: "About the Tool", icon: Info },
  { href: "/policy-codebook/map", label: "Interactive Map", icon: Globe2 },
  { href: "/policy-codebook/search", label: "Advanced Search", icon: FileSearch },
];

export default function PolicyNav() {
  const pathname = usePathname();
  const active = (href: string) =>
    href === "/policy-codebook"
      ? pathname === href
      : pathname.startsWith(href) ||
        (href.endsWith("/map") && pathname.includes("/countries/"));

  return (
    <header className="border-b border-blue-700 bg-brand-navy text-white">
      <div className="mx-auto max-w-[96rem] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/policy-codebook"
            className="mr-auto flex items-center gap-3 font-serif text-xl font-semibold sm:text-2xl"
          >
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center bg-white text-brand-navy"
            >
              ✚
            </span>
            Health AI Policy Dashboard
            <span className="hidden bg-white/15 px-2 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-blue-100 sm:inline">Prototype v0.3.2</span>
          </Link>
          <Link
            href="/hub"
            className="inline-flex min-h-11 items-center gap-2 border border-white/70 px-4 text-sm font-bold hover:bg-white hover:text-brand-navy"
          >
            <ArrowLeft size={16} aria-hidden /> Back to Innovator Insights
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-7 gap-y-2 border-t border-white/20 pt-3">
          <nav aria-label="Policy Codebook modules" className="flex flex-wrap gap-1 sm:gap-3">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={active(href) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center gap-2 border-b-4 px-3 text-sm font-bold ${
                  active(href)
                    ? "border-cyan-300 text-white"
                    : "border-transparent text-blue-100 hover:border-blue-200 hover:text-white"
                }`}
              >
                <Icon size={17} aria-hidden /> {label}
              </Link>
            ))}
          </nav>
          <a
            href="/policy-dashboard-demo/index.html"
            target="_blank"
            rel="noreferrer"
            className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-100 hover:text-white hover:underline"
          >
            Open preserved visual reference <ExternalLink size={14} aria-hidden />
          </a>
        </div>
      </div>
    </header>
  );
}
