"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";

/**
 * One testimonial at a time, with Previous / Next arrows and dots.
 * It never moves on its own, so people can read at their own pace.
 *
 * Real entries come from src/lib/testimonials.ts. While that list is empty,
 * `placeholders` are shown instead as "story coming soon" slides: a short
 * line about what the story will cover, never a made-up quote or name.
 */
export default function TestimonialCarousel({
  items,
  placeholders = [],
}: {
  items: Testimonial[];
  placeholders?: string[];
}) {
  const [index, setIndex] = useState(0);
  const showingPlaceholders = items.length === 0;
  const count = showingPlaceholders ? placeholders.length : items.length;
  if (count === 0) return null;

  const go = (step: number) => setIndex((i) => (i + step + count) % count);
  const label = showingPlaceholders ? "story" : "testimonial";

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Stories from innovators"
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
        {showingPlaceholders ? (
          <PlaceholderSlide text={placeholders[index]} />
        ) : (
          <RealSlide t={items[index]} />
        )}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            className="inline-flex h-11 w-11 items-center justify-center border border-brand-navy text-brand-navy hover:bg-blue-50"
            aria-label={`Previous ${label}`}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="inline-flex h-11 w-11 items-center justify-center border border-brand-navy text-brand-navy hover:bg-blue-50"
            aria-label={`Next ${label}`}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
          <div className="flex gap-2" role="group" aria-label={`Choose a ${label}`}>
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${label} ${i + 1} of ${count}`}
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

function RealSlide({ t }: { t: Testimonial }) {
  return (
    <>
      <div className="aspect-[4/3] bg-slate-200 sm:aspect-auto sm:h-full">
        {/* Small local photo supplied by the organization. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={t.photo} alt={t.photoAlt} className="h-full w-full object-cover" />
      </div>
      <figure className="px-6 pb-6 sm:py-8 sm:pl-0 sm:pr-8">
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
    </>
  );
}

function PlaceholderSlide({ text }: { text: string }) {
  return (
    <>
      <div className="flex aspect-[4/3] items-center justify-center bg-whisper p-4 text-center text-sm text-slate-600 sm:aspect-auto sm:h-full sm:min-h-44">
        Photo from the innovator&apos;s work
      </div>
      <div className="px-6 pb-6 sm:py-8 sm:pl-0 sm:pr-8">
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-brand-bronze">
          Story coming soon
        </p>
        <p className="mt-3 font-serif text-2xl leading-snug text-brand-navy">{text}</p>
        <p className="mt-4 text-[15px] text-slate-600">
          Each story will name the innovator and their organization, with a link to
          what they do. We share stories only with their permission.
        </p>
      </div>
    </>
  );
}
