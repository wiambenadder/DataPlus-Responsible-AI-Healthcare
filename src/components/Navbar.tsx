"use client";

// Site header. A plain navy bar, like a university web property: wordmark
// on the left, a few text links on the right, the current page underlined.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";

const REPORT_LINKS = [
  { href: "/report/assessment", label: "Assessment" },
  { href: "/report/history", label: "History" },
];

const ACCOUNT_LINKS = [
  { href: "/user", label: "Your profile" },
  { href: "/company", label: "Company details" },
];

/** Closes a dropdown when the user clicks outside it or presses Escape. */
function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return ref;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const reportRef = useDismiss(reportOpen, () => setReportOpen(false));
  const userRef = useDismiss(userOpen, () => setUserOpen(false));

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);
      setEmail(user?.email ?? null);
    }

    checkUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Close menus on navigation (adjusting state during render, as React
  // recommends, rather than in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setReportOpen(false);
    setUserOpen(false);
    setMobileOpen(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setSignedIn(false);
    router.push("/");
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const linkClass = (active: boolean) =>
    `relative py-1 text-[15px] text-white/85 hover:text-white ${
      active
        ? "text-white after:absolute after:inset-x-0 after:-bottom-[13px] after:h-[3px] after:bg-white"
        : ""
    }`;

  return (
    <header className="sticky top-0 z-50 bg-blue-600 text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-[19px] font-semibold tracking-tight text-white"
        >
          Innovator Insights
        </Link>

        {signedIn ? (
          <>
            <nav
              aria-label="Main"
              className="ml-auto hidden items-center gap-7 md:flex"
            >
              <div ref={reportRef} className="relative">
                <button
                  type="button"
                  aria-expanded={reportOpen}
                  onClick={() => setReportOpen((o) => !o)}
                  className={`${linkClass(isActive("/report"))} flex items-center gap-1`}
                >
                  Report
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
                {reportOpen && (
                  <Menu_ items={REPORT_LINKS} isActive={isActive} />
                )}
              </div>

              <Link href="/dashboard" className={linkClass(isActive("/dashboard"))}>
                Dashboard
              </Link>
              <Link href="/roadmap" className={linkClass(isActive("/roadmap"))}>
                Roadmap
              </Link>

              <div ref={userRef} className="relative">
                <button
                  type="button"
                  aria-expanded={userOpen}
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-1 rounded border border-white/30 px-2.5 py-1 text-sm text-white/90 hover:border-white/60 hover:text-white"
                >
                  Account
                  <ChevronDown className="h-4 w-4" aria-hidden />
                </button>
                {userOpen && (
                  <Menu_
                    items={ACCOUNT_LINKS}
                    isActive={isActive}
                    header={email}
                    footer={
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <LogOut className="h-4 w-4" aria-hidden />
                        Log out
                      </button>
                    }
                  />
                )}
              </div>
            </nav>

            <button
              type="button"
              className="ml-auto rounded p-1.5 text-white md:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        ) : (
          <div className="ml-auto flex items-center gap-5">
            <Link href="/login" className="text-[15px] text-white/85 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded border border-white/70 px-3 py-1 text-[15px] text-white hover:bg-white hover:text-blue-600"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {signedIn && mobileOpen && (
        <nav
          aria-label="Main"
          className="border-t border-white/15 bg-blue-700 px-4 pb-3 pt-1 md:hidden"
        >
          {[
            ...REPORT_LINKS.map((l) => ({ ...l, label: `Report · ${l.label}` })),
            { href: "/dashboard", label: "Dashboard" },
            { href: "/roadmap", label: "Roadmap" },
            ...ACCOUNT_LINKS,
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block border-b border-white/10 py-2.5 text-[15px] ${
                isActive(l.href) ? "font-semibold text-white" : "text-white/85"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={logout}
            className="mt-1 py-2.5 text-[15px] text-white/85"
          >
            Log out
          </button>
        </nav>
      )}
    </header>
  );
}

function Menu_({
  items,
  isActive,
  header,
  footer,
}: {
  items: { href: string; label: string }[];
  isActive: (href: string) => boolean;
  header?: string | null;
  footer?: React.ReactNode;
}) {
  return (
    <div className="absolute right-0 top-full mt-3 w-56 overflow-hidden rounded-md border border-slate-200 bg-white py-1 text-slate-800 shadow-lg">
      {header && (
        <p className="truncate border-b border-slate-100 px-4 pb-2 pt-1.5 text-xs text-slate-500">
          {header}
        </p>
      )}
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block px-4 py-2 text-sm hover:bg-slate-50 ${
            isActive(item.href) ? "font-semibold text-blue-600" : ""
          }`}
        >
          {item.label}
        </Link>
      ))}
      {footer && <div className="mt-1 border-t border-slate-100 pt-1">{footer}</div>}
    </div>
  );
}
