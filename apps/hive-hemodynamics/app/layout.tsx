// HIVE_FOOTER_SIGNATURE: "Made with ♥ in the Hive" rendered by HiveFooter
// below. Canonical Hive ink (#0a0a0a) used in app/globals.css.

import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import HiveFooter from "@/components/HiveFooter";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "https://hemodynamics.hive.baby";

const TITLE =
  "Hive Hemodynamics Engine — Advanced RV Risk & PAPi Analysis";
const DESCRIPTION =
  "Instantly compute the Pulmonary Artery Pulsatility Index (PAPi) and analyze right heart failure risks. Built for advanced heart failure teams.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Hive Hemodynamics",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "Hive Hemodynamics",
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
    siteName: "Hive Hemodynamics",
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
        <footer className="site-footer">
          <p>No ads. No investors. No agenda.</p>
          <p>Free at the base tier, forever.</p>
          <p>This is not medical advice. Always consult a qualified clinician.</p>
          <HiveFooter />
        </footer>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
