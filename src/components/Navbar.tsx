
// Navbar component - shows different links based on whether user is signed in or not
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  LayoutDashboard,
  FileText,
  History,
  Building2,
  FolderOpen,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [signedIn, setSignedIn] =
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
    <div className="
      bg-white
      border-b
      sticky
      top-0
      z-50
    ">

      <div className="
        max-w-7xl
        mx-auto
        px-6
        py-4
        flex
        justify-between
        items-center
      ">

        <Link
          href="/"
          className="
            font-semibold
            text-lg
          "
        >
          Innovator Insights Platform
        </Link>

        {signedIn ? (
          <div className="
            flex
            gap-6
            items-center
          ">

            <Link
              href="/dashboard"
              className="
                flex
                items-center
                gap-2
              "
            >
              <LayoutDashboard
                size={18}
              />
              Dashboard
            </Link>

            <Link
              href="/report"
              className="
                flex
                items-center
                gap-2
              "
            >
              <FileText
                size={18}
              />
              Report
            </Link>

            <Link
              href="/history"
              className="
                flex
                items-center
                gap-2
              "
            >
              <History
                size={18}
              />
              History
            </Link>

            <Link
              href="/company"
              className="
                flex
                items-center
                gap-2
              "
            >
              <Building2
                size={18}
              />
              Company
            </Link>
            <Link
              href="/standardize"
              className="
                flex
                items-center
              gap-2
            "
            >
  <FolderOpen size={18} />
  Standardize
</Link>
            <button
              onClick={logout}
              className="
                flex
                items-center
                gap-2
              "
            >
              <LogOut
                size={18}
              />
              Logout
            </button>

          </div>
        ) : (
          <div className="
            flex
            gap-4
          ">

            <Link href="/login">
              Login
            </Link>

            <Link href="/signup">
              Sign Up
            </Link>

          </div>
        )}

      </div>

    </div>
  );
}