"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";

/**
 * One testimonial at a time, with Previous / Next arrows and dots.
 * It never moves on its own, so people can read at their own pace.
 * Entries come from src/lib/testimonials.ts.
 */
export default function TestimonialCarousel({
  items,
  draft = false,
}: {
  items: Testimonial[];
  /** Draft slides (development only): grey photo box and a "pending" note. */
  draft?: boolean;
}) {
  const [index, setIndex] = useState(0);
  if (items.length === 0) return null;

  const count = items.length;
  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const t = items[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Testimonials from innovators"
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
    >
      <div
        className="grid gap-6 border bg-white sm:grid-cols-[minmax(0,15rem)_1fr] sm:gap-8"
        aria-live="polite"
        aria-roledescription="slide"
        aria-label={`${index + 1} of ${count}`}
      >
        <div className="aspect-[4/3] bg-slate-200 sm:aspect-auto sm:h-full">
          {draft ? (
            <div className="flex h-full min-h-40 items-center justify-center p-4 text-center text-sm text-slate-600">
              Event photo
            </div>
          ) : (
            // Small local photo supplied by the organization.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.photo} alt={t.photoAlt} className="h-full w-full object-cover" />
          )}
        </div>
        <figure className="px-6 pb-6 sm:py-8 sm:pl-0 sm:pr-8">
          {draft && (
            <p className="mb-2 text-sm font-semibold text-brand-bronze">
              Draft slide: quote pending approval
            </p>
          )}
          <blockquote className="font-serif text-2xl leading-snug text-brand-navy">
            “{t.quote}”
          </blockquote>
          <figcaption className="mt-5 text-[15px] text-slate-700">
            <span className="font-bold text-ink">{t.name}</span>, {t.role}
            <br />
            <a
              href={t.organizationUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-dukeblue underline underline-offset-4"
            >
              {t.organization}: what they do
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </figcaption>
        </figure>
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex h-11 w-11 items-center justify-center border border-brand-navy text-brand-navy hover:bg-blue-50"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex h-11 w-11 items-center justify-center border border-brand-navy text-brand-navy hover:bg-blue-50"
            aria-label="Next testimonial"
          >
            <ChevronRight size={20} aria-hidden />
          </button>
          <div className="flex gap-2" role="group" aria-label="Choose a testimonial">
            {items.map((item, i) => (
              <button
                key={`${item.name}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className={`h-3 w-3 rounded-full border border-brand-navy ${i === index ? "bg-brand-navy" : "bg-white"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
