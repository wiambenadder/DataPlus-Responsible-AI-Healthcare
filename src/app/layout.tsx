import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";

/*
 * Fonts are self-hosted (files in ./fonts, SIL Open Font License) so the
 * build doesn't depend on reaching Google Fonts.
 *   Source Sans 3  — body text and UI
 *   Source Serif 4 — page and section headings
 */
const sourceSans = localFont({
  src: [
    { path: "./fonts/source-sans-3-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/source-sans-3-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "200 900",
  display: "swap",
  variable: "--font-source-sans",
});

const sourceSerif = localFont({
  src: [
    { path: "./fonts/source-serif-4-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/source-serif-4-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "200 900",
  display: "swap",
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "Innovator Insights",
  description:
    "Evidence-based assessment of AI readiness for health innovators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full font-sans antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-slate-50 text-slate-900"
      >
        <Navbar />

        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
