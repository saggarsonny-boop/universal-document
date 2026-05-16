import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ocr | Universal Document Utilities",
  description: "AI-Powered Universal Document Ocr engine.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
