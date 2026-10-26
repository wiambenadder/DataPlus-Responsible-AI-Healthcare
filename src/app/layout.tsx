import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SiteHeader from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";

/*
 * Duke University brand typefaces (brand.duke.edu/typography), self-hosted
 * from ./fonts under the SIL Open Font License:
 *   Open Sans   — text, navigation, buttons and forms
 *   EB Garamond — page and section headings
 */
const openSans = localFont({
  src: [
    { path: "./fonts/open-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/open-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "300 800",
  display: "swap",
  variable: "--font-open-sans",
});

const ebGaramond = localFont({
  src: [
    { path: "./fonts/eb-garamond-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/eb-garamond-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "400 800",
  display: "swap",
  variable: "--font-eb-garamond",
});

export const metadata: Metadata = {
  title: "Innovator Insights",
  description:
    "Understand AI readiness, examine evidence, and plan next steps for responsible innovation in global health. A Duke Data+ project supported by Duke GHIC and Innovations in Healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${openSans.variable} ${ebGaramond.variable} h-full font-sans antialiased`}
    >
      <body
        suppressHydrationWarning
        className="flex min-h-screen flex-col bg-white text-ink"
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
