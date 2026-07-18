import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/** Application-wide metadata for SEO and social sharing. */
export const metadata: Metadata = {
  title: {
    default: "StadiumAI — Smart Stadiums & Tournament Operations",
    template: "%s | StadiumAI",
  },
  description:
    "AI-powered stadium management platform with smart seat recommendations, crowd density prediction, dynamic pricing, fraud detection, and tournament operations — built with Google Gemini, Firebase, and Next.js 15.",
  keywords: [
    "smart stadium",
    "tournament operations",
    "AI",
    "Gemini",
    "crowd density",
    "dynamic pricing",
    "fraud detection",
    "seat recommendation",
    "Firebase",
    "Next.js",
  ],
  authors: [{ name: "StadiumAI Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "StadiumAI",
    title: "StadiumAI — Smart Stadiums & Tournament Operations",
    description:
      "AI-powered stadium management platform for modern tournament operations.",
  },
  robots: { index: true, follow: true },
};

/**
 * Root layout wrapping every page in the application. Applies the Inter font
 * family, dark mode class support, and shared HTML metadata.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
