"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b p-4 flex gap-6">

      <Link href="/">
        Home
      </Link>

      <Link href="/report">
        Report
      </Link>

      <Link href="/history">
        History
      </Link>

      <Link href="/company-setup">
        Company Profile
      </Link>

      <Link href="/upload">
        Upload
      </Link>

    </div>
  );
}