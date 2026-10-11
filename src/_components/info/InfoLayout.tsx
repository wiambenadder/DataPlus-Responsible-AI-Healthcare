import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Inner-page layout in the DGHI pattern: breadcrumb, category label,
 * large serif title and lead paragraph, then the body with an
 * "On this page" list beside it on wide screens.
 */
export default function InfoLayout({
  label,
  title,
  lede,
  sections,
  children,
}: {
  label: string;
  title: string;
  lede: ReactNode;
  sections: { id: string; title: string }[];
  children: ReactNode;
}) {
  return (
    <div>
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span className="mx-2" aria-hidden>
              ›
            </span>
            <span>{title}</span>
          </nav>
          <p className="label-caps mt-8">{label}</p>
          <h1 className="mt-2 max-w-4xl text-4xl sm:text-5xl">{title}</h1>
          <div className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-700">{lede}</div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16 lg:px-8">
        <div className="min-w-0 space-y-12">{children}</div>

        <aside className="hidden lg:block">
          <nav aria-label="On this page" className="sticky top-6 border-l-4 border-brand-teal pl-5">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-600">On this page</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-dukeblue hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}

/** A titled section of an info page. */
export function InfoSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 border-t border-slate-200 pt-10 first:border-t-0 first:pt-0">
      <h2 id={`${id}-title`} className="text-3xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-slate-800">{children}</div>
    </section>
  );
}
