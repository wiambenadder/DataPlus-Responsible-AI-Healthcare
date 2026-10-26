"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SITE } from "@/lib/site";
import OrgLogo from "./OrgLogo";

const PUBLIC_LINKS = [
  { href: "/hub", label: "Home" },
  { href: "/about", label: "About us" },
  { href: "/hub#audiences", label: "Who this helps" },
  { href: "/hub#tools", label: "Our tools" },
  { href: "/data-use", label: "Data & trust" },
];
const WORKSPACE_LINKS = [
  { href: "/", label: "Your overview" },
  { href: "/report/assessment", label: "Submit evidence" },
  { href: "/report/history", label: "Submissions" },
  { href: "/dashboard", label: "Results" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/company", label: "Company & team" },
  { href: "/user", label: "Profile" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data: { user } }) => {
        if (active) setSignedIn(Boolean(user));
      })
      .catch(() => {
        if (active) setSignedIn(false);
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session?.user));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        toggleRef.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMobileOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [mobileOpen]);

  async function logout() {
    await supabase.auth.signOut();
    setSignedIn(false);
    setMobileOpen(false);
    router.push("/hub");
  }

  const active = (href: string) => !href.includes("#") && pathname === href;
  const linkClass = (href: string) =>
    `inline-flex min-h-12 items-center border-b-2 px-1 text-sm font-semibold ${active(href) ? "border-brand-navy text-brand-navy" : "border-transparent text-slate-600 hover:border-brand-dukeblue hover:text-brand-navy"}`;

  return (
    <>
      <div id="top" className="bg-brand-navy text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-5 px-6 py-6 sm:px-8">
          <a
            href={SITE.dukeUrl}
            className="block p-1"
            aria-label="Duke Global Health Innovation Center website"
          >
            {/* Official source asset, kept at its original proportions. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE.dukeLogo}
              alt="Duke Global Health Innovation Center"
              width={768}
              height={141}
              className="h-auto w-56 sm:w-64"
            />
          </a>
          <a
            href={SITE.orgUrl}
            className="block p-1"
            aria-label="Innovations in Healthcare website"
          >
            <OrgLogo className="h-auto max-h-12 w-48 sm:w-56" />
          </a>
          <p className="ml-auto hidden max-w-44 border-l border-white/30 pl-6 text-xs leading-relaxed text-blue-100 xl:block">
            Supporting responsible innovation in global health
          </p>
        </div>
      </div>
      <header ref={headerRef} className="sticky top-0 z-50 bg-white shadow-md">
        <div className="border-b bg-white">
          <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-6 px-6 sm:px-8">
            <Link
              href="/hub"
              className="flex shrink-0 items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <span className="font-serif text-2xl text-brand-navy sm:text-3xl">
                {SITE.name}
              </span>
            </Link>
            <nav
              aria-label="Main navigation"
              className="ml-auto hidden items-center gap-5 xl:flex"
            >
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(link.href) ? "page" : undefined}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={signedIn ? "/" : "/login"}
                className="btn btn-secondary px-4 py-2 text-sm"
              >
                {signedIn ? "Your workspace" : "Log in"}
              </Link>
            </nav>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((open) => !open)}
              className="ml-auto inline-flex min-h-12 items-center gap-2 px-2 text-sm font-bold text-brand-navy xl:hidden"
            >
              {mobileOpen ? (
                <X size={22} aria-hidden />
              ) : (
                <Menu size={22} aria-hidden />
              )}
              <span>{mobileOpen ? "Close" : "Menu"}</span>
            </button>
          </div>
          {mobileOpen && (
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-t px-6 pb-6 xl:hidden"
              onClick={(event) => {
                if ((event.target as Element).closest("a"))
                  setMobileOpen(false);
              }}
            >
              {PUBLIC_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(link.href) ? "page" : undefined}
                  className="block border-b py-3 font-semibold text-brand-navy"
                >
                  {link.label}
                </Link>
              ))}
              {signedIn ? (
                <>
                  <p className="label-caps mt-5">Your workspace</p>
                  {WORKSPACE_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={active(link.href) ? "page" : undefined}
                      className="block py-3 text-brand-navy"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    type="button"
                    className="min-h-12 font-bold text-brand-navy"
                    onClick={logout}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <div className="mt-5 flex flex-wrap gap-4">
                  <Link href="/login" className="btn btn-primary">
                    Log in
                  </Link>
                  <Link href="/signup" className="btn btn-secondary">
                    Create an account
                  </Link>
                </div>
              )}
            </nav>
          )}
        </div>
        {signedIn && (
          <nav
            aria-label="Your workspace"
            className="hidden border-b bg-slate-50 xl:block"
          >
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 px-8">
              {WORKSPACE_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active(link.href) ? "page" : undefined}
                  className={linkClass(link.href)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={logout}
                className="ml-auto min-h-12 text-sm font-semibold text-brand-navy"
              >
                Log out
              </button>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
