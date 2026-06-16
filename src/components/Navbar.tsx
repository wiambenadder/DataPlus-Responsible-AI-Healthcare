// creates the navigation bar at the top of the page, which includes links to different pages and a logout button if the user is signed in

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import {
  Building2,
  FileText,
  History,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();

  const [signedIn, setSignedIn] =
    useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setSignedIn(!!user);
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="border-b bg-white/80 backdrop-blur">

      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">

        <Link
          href="/"
          className="font-semibold text-lg"
        >
          Data Intelligence
        </Link>

        {signedIn && (
          <div className="flex gap-6">

            <Link
              href="/report"
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Report
            </Link>

            <Link
              href="/history"
              className="flex items-center gap-2"
            >
              <History size={16} />
              History
            </Link>

            <Link
              href="/company"
              className="flex items-center gap-2"
            >
              <Building2 size={16} />
              Company
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </button>

          </div>
        )}

      </div>

    </div>
  );
}