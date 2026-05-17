// HIVE_FOOTER_SIGNATURE: "Made with ♥ in the Hive" rendered by HiveFooter
// below. Canonical Hive ink (#0a0a0a) used in app/globals.css.

import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { HiveFooter } from "@/components/HiveFooter";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://legal.hive.baby";

const TITLE =
  "HiveLegal — The Autonomous Redline Engine";
const DESCRIPTION =
  "Don't Buy Software. Augment Your Legal Team. Paste any contract and let the Maker-Checker protocol audit it against a strict dealbreaker matrix.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveLegal",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveLegal",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "HiveLegal",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="min-h-screen antialiased">
        {children}
        <script src="https://marketing.hive.baby/hive-track.js" async></script>
      </body>
    </html>
  );
}
