import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import { ServiceWorkerRegistrar } from "./_lib/ServiceWorkerRegistrar";
import { HiveHeader } from "./_lib/HiveHeader";

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-display', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' })
const dmMono = DM_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' })

const APP_URL = "https://activity.hive.baby";

const TITLE = "Hive AAC™ (Autonomous AI Companion) - Enterprise Portal";
const DESCRIPTION = "Enterprise-grade Autonomous AI Companion deployment portal. Highly configurable, tenant-isolated AI agents for clinical, practice, and corporate domains.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Hive AAC",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "Hive AAC",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/hive-mark.svg", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/hive-mark.svg"],
  },
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Hive AAC",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <head>
      </head>
      <body
        style={{
          margin: 0,
          background: "#0a0a0a",
          color: "#f5f1e6",
          fontFamily:
            "var(--font-body), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          WebkitFontSmoothing: "antialiased",
          minHeight: "100dvh",
        }}
      >
        <HiveHeader />
        {children}
        <ServiceWorkerRegistrar />
      
        <script src="https://marketing.hive.baby/hive-track.js" async></script>
      </body>
    </html>
  );
}
