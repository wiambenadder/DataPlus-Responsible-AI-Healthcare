"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * Innovations in Healthcare logo for dark backgrounds. Falls back to the
 * organization name in text if the image can't be loaded.
 */
export default function OrgLogo({ className = "h-9" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="max-w-[9rem] text-[13px] font-semibold leading-tight text-white">
        {SITE.org}
      </span>
    );
  }

  return (
    // A plain <img>: the logo is a small, fixed-size remote file and doesn't
    // need Next's image optimiser.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SITE.orgLogo}
      alt={SITE.org}
      className={className}
      // If the image already failed before React attached onError (e.g.
      // during hydration), catch it here.
      ref={(el) => {
        if (el && el.complete && el.naturalWidth === 0) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}
