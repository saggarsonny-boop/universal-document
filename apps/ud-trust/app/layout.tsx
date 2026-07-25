import CrossPollinationModal from '@/components/CrossPollinationModal';
import HiveOpsWidget from '@/components/HiveOpsWidget';
import './globals.css';
import type { Metadata } from "next";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "./globals.css";

export const metadata: Metadata = {
  title: "UD Trust | Sovereign Analysis",
  description: "Enterprise clarity engine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="container">
            <header className="navbar">
              <a href="/" className="logo">UD Trust</a>
              <div>
                <SignedIn><UserButton afterSignOutUrl="/"/></SignedIn>
                <SignedOut><a href="/sign-in" className="btn">Authenticate</a></SignedOut>
              </div>
            </header>
            <main>{children}</main>
          </div>
        
        
        <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '0.875rem', position: 'relative', zIndex: 10, marginTop: 'auto' }}>
          <div>Made with ♥ in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.7 }}>This is a Hive engine. We collect zero personal data. No login, no account, no tracking.</div>
        </footer>
        <HiveOpsWidget />
      
        <CrossPollinationModal sourceEngine="ud-trust" targetEngine="UD Converter" targetUrl="https://converter.universaldocument.org" description="Need to convert or unlock complex documents? Try the UD Converter." />
      
        <script src="https://marketing.hive.baby/hive-track.js" async></script>
