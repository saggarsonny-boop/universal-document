import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chain Of Custody | Universal Document Utilities",
  description: "AI-Powered Universal Document Chain Of Custody engine.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
