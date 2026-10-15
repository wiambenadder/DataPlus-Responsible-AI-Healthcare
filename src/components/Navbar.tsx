"use client";

/*
 * Site header in the pattern of Duke websites: a thin dark utility bar,
 * then a navy bar with the Innovations in Healthcare logo and the
 * "Innovator Insights" wordmark on the left and the main navigation on the
 * right. Labels are title case.
 *
 * From innovator feedback: "Report" was unclear, so the menu is "Submit
 * Evidence" with plain descriptions, and there is an explicit "Home" link
 * because the old logo "did not look clickable".
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import OrgLogo from "./OrgLogo";

const SUBMIT_LINKS = [
  {
    href: "/report/assessment",
    label: "Upload Documents and Answer Questions",
    note: "Start or update your assessment",
  },
  {
    href: "/report/history",
    label: "Your Submissions",
    note: "Documents and answers you have already sent",
  },
];

const ACCOUNT_LINKS = [
  { href: "/user", label: "Your Profile" },
  { href: "/company", label: "Company and Team" },
];

const INFO_LINKS = [
  { href: "/about", label: "About" },
  { href: "/framework", label: "The Framework" },
  { href: "/data-use", label: "How We Use Your Data" },
  { href: "/hub", label: "All Tools" },
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
  const [submitOpen, setSubmitOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitRef = useDismiss(submitOpen, () => setSubmitOpen(false));
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
    setSubmitOpen(false);
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

  const navLink = (active: boolean) =>
    `relative flex h-full items-center whitespace-nowrap text-[15px] font-semibold text-white ${
      active
        ? "after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-white"
        : "text-white/90 hover:text-white"
    }`;

  const dropdown =
    "absolute top-full z-10 border border-slate-200 border-t-4 border-t-brand-navy bg-white py-2 shadow-lg";

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
          <Link
            href={signedIn ? "/" : "/hub"}
            className="group flex items-center gap-4"
            aria-label={`${SITE.name} home`}
          >
            <OrgLogo className="h-7 sm:h-9" />
            <span className="h-9 w-px bg-white/40" aria-hidden />
            <span className="whitespace-nowrap font-serif text-[21px] font-medium leading-none text-white sm:text-[25px] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
              {SITE.name}
            </span>
          </Link>

          {signedIn ? (
            <nav aria-label="Main" className="ml-auto hidden items-stretch gap-5 lg:flex xl:gap-7">
              <Link href="/hub" className={navLink(isActive("/hub"))}>
                All Tools
              </Link>
              <Link href="/" className={navLink(isActive("/"))}>
                Home
              </Link>

              <div ref={submitRef} className="relative flex items-stretch">
                <button
                  type="button"
                  aria-expanded={submitOpen}
                  onClick={() => setSubmitOpen((o) => !o)}
                  className={`${navLink(isActive("/report"))} gap-1`}
                >
                  Submit Evidence
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
                {submitOpen && (
                  <div className={`${dropdown} left-0 w-80`}>
                    {SUBMIT_LINKS.map((l) => (
                      <Link key={l.href} href={l.href} className="block px-4 py-2.5 hover:bg-slate-50">
                        <span className="block text-[15px] font-semibold text-brand-navy">{l.label}</span>
                        <span className="block text-sm text-slate-600">{l.note}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/dashboard" className={navLink(isActive("/dashboard"))}>
                Results
              </Link>
              <Link href="/roadmap" className={navLink(isActive("/roadmap"))}>
                Roadmap
              </Link>

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
                  <div className={`${dropdown} right-0 w-56`}>
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
            <nav aria-label="Main" className="ml-auto hidden items-stretch gap-5 lg:flex xl:gap-7">
              <Link href="/hub" className={navLink(isActive("/hub"))}>
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

      {mobileOpen && (
        <nav aria-label="Main" className="border-b border-slate-200 bg-white px-4 pb-4 lg:hidden">
          {(signedIn
            ? [
                { href: "/hub", label: "All Tools" },
                { href: "/", label: "Home" },
                ...SUBMIT_LINKS,
                { href: "/dashboard", label: "Results" },
                { href: "/roadmap", label: "Roadmap" },
                ...ACCOUNT_LINKS,
                ...INFO_LINKS.filter((l) => l.href !== "/hub"),
              ]
            : [
                { href: "/hub", label: "All Tools" },
                { href: "/login", label: "Log In" },
                { href: "/signup", label: "Create an Account" },
                ...INFO_LINKS.filter((l) => l.href !== "/hub"),
              ]
          ).map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className={`block border-b border-slate-100 py-3 text-[15px] font-semibold ${
                isActive(l.href) ? "text-brand-dukeblue" : "text-brand-navy"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {signedIn && (
            <button
              type="button"
              onClick={logout}
              className="block w-full py-3 text-left text-[15px] font-semibold text-slate-700"
            >
              Log Out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
