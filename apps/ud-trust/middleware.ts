import { NextResponse } from 'next/server';

// Hive Unified Auth Middleware (Scaffolded)
// Wraps the engine in a session layer (Clerk/Supabase) to track paid status
export function middleware(request) {
  // TODO: Add Clerk or Supabase Auth logic here
  // If user is trying to access /pro and hasPaid === false, redirect to /pricing
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
