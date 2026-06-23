"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  ChevronDown,
  UserCircle,
  LogOut,
  Building2,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [signedIn, setSignedIn] =
    useState(false);

  const [reportOpen, setReportOpen] =
    useState(false);

  const [userOpen, setUserOpen] =
    useState(false);

  useEffect(() => {
    checkUser();

    const { data: listener } =
      supabase.auth.onAuthStateChange(() => {
        checkUser();
      });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setSignedIn(!!user);
  }

  async function logout() {
    await supabase.auth.signOut();

    setSignedIn(false);

    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">

      <div className="mx-auto flex max-w-7xl items-center px-6 py-4">

        {/* Logo */}

        <Link
          href="/"
          className="flex items-center gap-3 font-semibold"
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              text-sm
              font-bold
              text-white
            "
          >
            IiH
          </div>

          <span className="text-lg">
            Innovator Insights
          </span>
        </Link>

        {/* Right Navigation */}

        {signedIn && (
          <div className="ml-auto flex items-center gap-5">

            {/* Report Dropdown */}

            <div className="relative">

              <button
                onClick={() =>
                  setReportOpen(!reportOpen)
                }
                className="
                  flex
                  items-center
                  gap-1
                  text-sm
                  font-medium
                "
              >
                Report
                <ChevronDown size={16} />
              </button>

              {reportOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-52
                    rounded-2xl
                    border
                    bg-white
                    p-2
                    shadow-lg
                  "
                >

                  <Link
                    href="/report/background"
                    onClick={() =>
                      setReportOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      hover:bg-slate-50
                    "
                  >
                    Background
                  </Link>

                  <Link
                    href="/report/assessment"
                    onClick={() =>
                      setReportOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      hover:bg-slate-50
                    "
                  >
                    Assessment
                  </Link>

                  <Link
                    href="/report/data"
                    onClick={() =>
                      setReportOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      hover:bg-slate-50
                    "
                  >
                    Data
                  </Link>

                  <Link
                    href="/report/history"
                    onClick={() =>
                      setReportOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      hover:bg-slate-50
                    "
                  >
                    History
                  </Link>

                </div>
              )}

            </div>

            {/* Dashboard */}

            <Link
              href="/dashboard"
              className="
                text-sm
                font-medium
              "
            >
              Dashboard
            </Link>

            {/* Roadmap */}

            <Link
              href="/roadmap"
              className="
                text-sm
                font-medium
              "
            >
              Roadmap
            </Link>

            {/* User Menu */}

            <div className="relative">

              <button
                onClick={() =>
                  setUserOpen(!userOpen)
                }
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <UserCircle size={28} />
                <ChevronDown size={16} />
              </button>

              {userOpen && (
                <div
                  className="
                    absolute
                    right-0
                    mt-3
                    w-48
                    rounded-2xl
                    border
                    bg-white
                    p-2
                    shadow-lg
                  "
                >

                  <Link
                    href="/user"
                    onClick={() =>
                      setUserOpen(false)
                    }
                    className="
                      block
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      hover:bg-slate-50
                    "
                  >
                    User
                  </Link>

                  <Link
                    href="/company"
                    onClick={() =>
                      setUserOpen(false)
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2
                      text-sm
                      hover:bg-slate-50
                    "
                  >
                    <Building2 size={16} />
                    Company
                  </Link>

                  <button
                    onClick={logout}
                    className="
                      flex
                      w-full
                      items-center
                      gap-2
                      rounded-xl
                      px-4
                      py-2
                      text-left
                      text-sm
                      text-red-600
                      hover:bg-red-50
                    "
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>

                </div>
              )}

            </div>

          </div>
        )}

        {!signedIn && (
          <div className="ml-auto flex items-center gap-4">

            <Link
              href="/login"
              className="
                text-sm
                font-medium
              "
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="
                rounded-xl
                bg-blue-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
              "
            >
              Sign Up
            </Link>

          </div>
        )}

      </div>

    </nav>
  );
}