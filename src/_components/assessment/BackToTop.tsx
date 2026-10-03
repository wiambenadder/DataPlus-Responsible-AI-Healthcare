"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Appears once the reader is well down the page. */
export default function BackToTop({ threshold = 700 }: { threshold?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0 });
        history.replaceState(null, "", window.location.pathname + window.location.search);
      }}
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-blue-600 shadow-lg hover:border-blue-600"
    >
      <ArrowUp className="h-4 w-4" aria-hidden />
      Back to top
    </button>
  );
}
