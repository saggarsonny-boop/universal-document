import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hive Teleprompter — Machine Over Human Engine",
  description: "A free, open-source teleprompter built by The Hive.",
  themeColor: "#D4AF37",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Teleprompter",
    statusBarStyle: "black-translucent",
  },
  alternates: {
    canonical: "https://teleprompter.hive.baby",
  },
  openGraph: {
    title: "Hive Teleprompter — Machine Over Human Engine",
    description: "A professional-grade, locally-encrypted, mirror-mode enabled teleprompter rig. No cloud. No tracking. Pure Machine Over Human performance.",
    url: "https://teleprompter.hive.baby",
    siteName: "The Hive",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Hive Teleprompter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hive Teleprompter — Machine Over Human Engine",
    description: "A free, open-source teleprompter built by The Hive.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Hive Teleprompter",
    "operatingSystem": "Web",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <html lang="en">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>
          {children}
        </Providers>
        <Analytics />
      
        <script src="https://marketing.hive.baby/hive-track.js" async></script>
      </body>
    </html>
  );
}
