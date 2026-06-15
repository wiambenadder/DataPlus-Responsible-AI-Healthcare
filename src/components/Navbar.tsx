//main navigation bar for the app, shows different links based on whether the user is signed in or not

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
    <div className="border-b p-4 flex justify-between">
      <Link href="/" className="font-bold">
        Data Intelligence Platform
      </Link>

      <div className="flex gap-4">
        {isSignedIn ? (
          <>
            <Link href="/report">Report</Link>
            <Link href="/history">History</Link>
            <Link href="/upload">Upload</Link>
            <Link href="/company">Company Profile</Link>
            <button onClick={logout}>Logout</button>
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