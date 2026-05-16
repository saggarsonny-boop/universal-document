import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redact | Universal Document Utilities",
  description: "AI-Powered Universal Document Redact engine.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
