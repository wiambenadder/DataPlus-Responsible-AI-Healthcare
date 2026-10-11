import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

/*
 * Fonts match the Duke Global Health Institute website and are
 * self-hosted (files in ./fonts, SIL Open Font License):
 *   Work Sans — text, navigation, buttons and forms
 *   Spectral  — page and section headings
 */
const workSans = localFont({
  src: [
    { path: "./fonts/work-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/work-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "100 900",
  display: "swap",
  variable: "--font-work-sans",
});

const spectral = localFont({
  src: [
    { path: "./fonts/spectral-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/spectral-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/spectral-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/spectral-latin-600-italic.woff2", weight: "600", style: "italic" },
  ],
  display: "swap",
  variable: "--font-spectral",
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
      className={`${workSans.variable} ${spectral.variable} h-full font-sans antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-white text-slate-900"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to main content
        </a>
        <SiteHeader />

        <main id="main-content" className="flex-1">
          {children}
        </main>

        <SiteFooter />
      </body>
    </html>
  );
}
