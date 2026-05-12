import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ServiceWorkerRegistrar } from "./_lib/ServiceWorkerRegistrar";
import { HiveHeader } from "./_lib/HiveHeader";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://activitypartner.hive.baby";

const TITLE = "HiveActivityPartner — Find someone to do the thing with";
const DESCRIPTION = "Meet a stranger to share an activity with — safely, on your terms. Private profiles, never indexed. Free at the base tier, forever.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "HiveActivityPartner",
  manifest: "/manifest.json",
  alternates: { canonical: APP_URL },
  appleWebApp: {
    capable: true,
    title: "HiveActivityPartner",
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
    siteName: "HiveActivityPartner",
    title: TITLE,
    description: DESCRIPTION,
  },
  // Privacy hard rule: the entire engine is noindex,nofollow. Profiles are
  // private; we never want a search engine surfacing a HAP page.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#D4AF37",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <meta name="robots" content="noindex,nofollow" />
        </head>
        <body
          style={{
            margin: 0,
            background: "#0a0a0a",
            color: "#f5f1e6",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            WebkitFontSmoothing: "antialiased",
            minHeight: "100dvh",
          }}
        >
          <HiveHeader />
          {children}
          <ServiceWorkerRegistrar />
        </body>
      </html>
    </ClerkProvider>
  );
}
