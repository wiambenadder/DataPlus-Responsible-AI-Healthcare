"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { openStoredFile } from "@/lib/storage";

/**
 * Opens an uploaded PDF in a new tab, and says so plainly if it can't
 * (instead of leaving the user on a storage error page).
 */
export default function OpenFileButton({
  path,
  children,
  className,
}: {
  path: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "opening" | "failed">("idle");

  async function open() {
    setState("opening");
    const ok = await openStoredFile(path);
    setState(ok ? "idle" : "failed");
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-x-2">
      <button
        type="button"
        onClick={open}
        disabled={state === "opening"}
        className={className ?? "inline-flex items-center gap-1 font-semibold text-brand-dukeblue hover:underline"}
      >
        {state === "opening" ? "Opening…" : children}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </button>
      {state === "failed" && (
        <span role="alert" className="text-sm text-red-700">
          This file couldn&apos;t be opened. It may have been moved or removed —
          please let the platform team know.
        </span>
      )}
    </span>
  );
}
