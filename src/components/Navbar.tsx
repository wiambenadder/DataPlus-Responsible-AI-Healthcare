"use client";

/*
 * Site header, in the pattern of Duke websites: a thin dark utility bar,
 * then a navy bar with the Innovations in Healthcare logo and the
 * "Innovator Insights" wordmark on the left and the main navigation on the
 * right. Labels are title case.
 *
 * The platform has three tools (AI Readiness, Financing, Policy), so the
 * main menu names the tools, and each tool gets its own row of links
 * underneath when you're inside it. Today only the AI Readiness
 * Assessment has pages of its own (Overview, Submit Evidence, Results,
 * Roadmap); when a codebook grows pages, give it a section in TOOL_SECTIONS
 * the same way.
 *
 * From innovator feedback: "Report" was unclear, so the page is called
 * "Submit Evidence", and the old logo "did not look clickable", so there
 * are plain-text links to every page.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import OrgLogo from "./OrgLogo";

/** The tools, in the main menu for signed-in users. */
const TOOLS = [
  { href: "/", label: "AI Readiness", match: ["/", "/report", "/dashboard", "/roadmap"] },
  { href: "/financing-codebook", label: "Financing", match: ["/financing-codebook"] },
  { href: "/policy-codebook", label: "Policy", match: ["/policy-codebook"] },
];

/** The pages inside the AI Readiness Assessment (the second row). */
const ASSESSMENT_PAGES = [
  { href: "/", label: "Overview" },
  { href: "/report/assessment", label: "Submit Evidence" },
  { href: "/report/history", label: "Your Submissions" },
  { href: "/dashboard", label: "Results" },
  { href: "/roadmap", label: "Roadmap" },
];

const ACCOUNT_LINKS = [
  { href: "/user", label: "Your Profile" },
  { href: "/company", label: "Company and Team" },
];

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/framework", label: "The Framework" },
  { href: "/data-use", label: "How We Use Your Data" },
];

/** Closes a dropdown on outside click or Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

export default function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const accountRef = useDismiss(accountOpen, () => setAccountOpen(false));

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);
      setEmail(user?.email ?? null);
    }
    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => checkUser());
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close menus on navigation (adjusting state during render rather than
  // in an effect, as React recommends).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setAccountOpen(false);
    setMobileOpen(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSignedIn(false);
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const inTool = (match: string[]) => match.some((m) => isActive(m));
  const inAssessment = signedIn && inTool(TOOLS[0].match);

  const navLink = (active: boolean) =>
    `relative flex h-full items-center whitespace-nowrap text-[15px] font-semibold text-white ${
      active
        ? "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-white"
        : "text-white/90 hover:text-white"
    }`;

  return (
    <header id="top" className="relative z-50">
      {/* Utility bar */}
      <div className="bg-brand-darkblue text-[13px] text-white/85">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-end gap-6 px-4 sm:px-6 lg:px-8">
          <nav aria-label="Information" className="hidden items-center gap-6 sm:flex">
            {INFO_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
          <span className="hidden h-4 w-px bg-white/25 sm:block" aria-hidden />
          {signedIn ? (
            <span className="flex items-center gap-5">
              <span className="hidden max-w-[16rem] truncate text-white/65 md:inline">{email}</span>
              <button type="button" onClick={logout} className="hover:text-white hover:underline">
                Log Out
              </button>
            </span>
          ) : (
            <span className="flex items-center gap-5">
              <Link href="/login" className="hover:text-white hover:underline">
                Log In
              </Link>
              <Link href="/signup" className="hover:text-white hover:underline">
                Create an Account
              </Link>
            </span>
          )}
        </div>
      </div>

      {/* Main bar */}
      <div className="bg-brand-navy">
        <div className="mx-auto flex h-[78px] max-w-7xl items-stretch gap-6 px-4 sm:px-6 lg:px-8">
          {/* The logo always leads to All Tools, the front door to all three tools. */}
          <Link href="/hub" className="group flex items-center gap-4" aria-label={`${SITE.name}: All Tools`}>
            <OrgLogo className="h-7 sm:h-9" />
            <span className="h-9 w-px bg-white/40" aria-hidden />
            <span className="whitespace-nowrap font-serif text-[21px] font-medium leading-none text-white group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 sm:text-[25px]">
              {SITE.name}
            </span>
          </Link>

          {signedIn ? (
            <nav aria-label="Main" className="ml-auto hidden items-stretch gap-6 lg:flex xl:gap-8">
              <Link href="/hub" className={navLink(isActive("/hub"))}>
                All Tools
              </Link>
              {TOOLS.map((t) => (
                <Link key={t.href} href={t.href} className={navLink(inTool(t.match))}>
                  {t.label}
                </Link>
              ))}

              <div ref={accountRef} className="relative flex items-stretch">
                <button
                  type="button"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((o) => !o)}
                  className={`${navLink(isActive("/user") || isActive("/company"))} gap-1`}
                >
                  Account
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full z-10 w-56 border border-slate-200 border-t-4 border-t-brand-navy bg-white py-2 shadow-lg">
                    {ACCOUNT_LINKS.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="block px-4 py-2 text-[15px] text-brand-navy hover:bg-slate-50"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={logout}
                      className="block w-full border-t border-slate-100 px-4 py-2 text-left text-[15px] text-slate-700 hover:bg-slate-50"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </nav>
          ) : (
            <nav aria-label="Main" className="ml-auto hidden items-stretch gap-7 lg:flex">
              <Link href="/hub" className={navLink(isActive("/hub") || pathname === "/")}>
                All Tools
              </Link>
              <Link href="/about" className={navLink(isActive("/about"))}>
                About
              </Link>
              <Link href="/login" className={navLink(isActive("/login"))}>
                Log In
              </Link>
              <span className="flex items-center">
                <Link href="/signup" className="btn btn-outline-light py-1.5 text-[15px]">
                  Create an Account
                </Link>
              </span>
            </nav>
          )}

          <button
            type="button"
            className="ml-auto self-center p-2 text-white lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Second row: the pages of the tool you're in. */}
      {inAssessment && (
        <nav aria-label="AI Readiness Assessment" className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-stretch gap-6 overflow-x-auto px-4 sm:px-6 lg:px-8">
            <span className="hidden shrink-0 items-center py-3 font-serif text-[1.15rem] text-brand-navy md:flex">
              AI Readiness Assessment
            </span>
            <span className="my-3 hidden w-px shrink-0 bg-slate-200 md:block" aria-hidden />
            <ul className="flex items-stretch gap-6">
              {ASSESSMENT_PAGES.map((p) => {
                const active = isActive(p.href);
                return (
                  <li key={p.href} className="flex">
                    <Link
                      href={p.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center whitespace-nowrap border-b-[3px] py-3 text-[14.5px] font-semibold ${
                        active
                          ? "border-brand-navy text-brand-navy"
                          : "border-transparent text-slate-600 hover:text-brand-navy"
                      }`}
                    >
                      {p.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      )}

      {mobileOpen && (
        <nav aria-label="Main" className="border-b border-slate-200 bg-white px-4 pb-4 lg:hidden">
          {signedIn ? (
            <>
              <MobileLink href="/hub" label="All Tools" active={isActive("/hub")} />
              <p className="pt-4 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate-500">
                AI Readiness Assessment
              </p>
              {ASSESSMENT_PAGES.map((p) => (
                <MobileLink key={p.href} href={p.href} label={p.label} active={isActive(p.href)} indent />
              ))}
              <MobileLink href="/financing-codebook" label="Financing Codebook" active={isActive("/financing-codebook")} />
              <MobileLink href="/policy-codebook" label="Policy Codebook" active={isActive("/policy-codebook")} />
              <p className="pt-4 text-[0.72rem] font-bold uppercase tracking-[0.1em] text-slate-500">Account</p>
              {ACCOUNT_LINKS.map((l) => (
                <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} indent />
              ))}
              {INFO_LINKS.map((l) => (
                <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />
              ))}
              <button
                type="button"
                onClick={logout}
                className="block w-full py-3 text-left text-[15px] font-semibold text-slate-700"
              >
                Log Out
              </button>
            </>
          ) : (
            [
              { href: "/hub", label: "All Tools" },
              { href: "/login", label: "Log In" },
              { href: "/signup", label: "Create an Account" },
              ...INFO_LINKS,
            ].map((l) => <MobileLink key={l.href} href={l.href} label={l.label} active={isActive(l.href)} />)
          )}
        </nav>
      )}
    </header>
  );
}

function MobileLink({
  href,
  label,
  active,
  indent = false,
}: {
  href: string;
  label: string;
  active: boolean;
  indent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block border-b border-slate-100 py-3 text-[15px] font-semibold ${indent ? "pl-3" : ""} ${
        active ? "text-brand-dukeblue" : "text-brand-navy"
      }`}
    >
      {label}
    </Link>
  );
}
