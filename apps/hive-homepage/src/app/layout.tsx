import type { Metadata } from "next";
import { HiveFooter } from "@/components/HiveFooter";
import { Inter } from "next/font/google";
import { HiveFooter } from "@/components/HiveFooter";
import "./globals.css";
import { HiveFooter } from "@/components/HiveFooter";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Hive | Machine Over Human Architecture",
  description: "The Hive is the systemic reinvention engine and infrastructure layer for the new physician.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}
        <HiveFooter />
        <script src="https://marketing.hive.baby/hive-track.js" async></script>
      </body>
    </html>
  );
}
