import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import RssTicker from "./RssTicker";
import AweLighting from "./AweLighting";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter" 
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair" 
});

export const metadata: Metadata = {
  title: "The New Physician | Sonny Saggar MD",
  description: "From Collapse to Reinvention. The central hub for Sonny Saggar MD.",
  manifest: "/manifest.json",
  openGraph: {
    title: "The New Physician | Sonny Saggar MD",
    description: "From Collapse to Reinvention. The central hub for Sonny Saggar MD.",
    url: "https://newphysician.org",
    siteName: "The New Physician",
    images: [
      {
        url: "https://newphysician.org/banner.png",
        width: 1200,
        height: 630,
        alt: "The New Physician Background Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} scroll-smooth`}>
      <body className={`${inter.className} bg-[#0a0a0a] text-neutral-300 antialiased selection:bg-[#D4AF37] selection:text-black`}>
        {/* Subtle Kintsugi Global Border */}
        <div className="fixed top-0 left-0 w-full h-[3px] z-[100] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-60 shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div>
        {/* Global Lightning Background */}
        <AweLighting />
        {children}
        <RssTicker />
        <Analytics />
      </body>
    </html>
  );
}
