// represents the navigation bar of the application, showing different links based on the user's authentication status. It uses Supabase for authentication and Next.js for routing.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
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

    setIsSignedIn(!!user);
  }

  async function logout() {
    await supabase.auth.signOut();
    setIsSignedIn(false);
    router.push("/");
  }

  return (
    <div className="border-b p-4 flex justify-between items-center">
      <Link href="/" className="font-bold">
        Data Intelligence Platform
      </Link>

      <div className="flex gap-4 items-center">
        {isSignedIn ? (
          <>
            <Link href="/report">Report</Link>
            <Link href="/history">History</Link>
            <Link href="/upload">Upload</Link>
            <Link href="/standardize">Standardize</Link>
            <Link href="/company">Company Profile</Link>

            <button
              onClick={logout}
              className="border px-3 py-1"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </div>
  );
}