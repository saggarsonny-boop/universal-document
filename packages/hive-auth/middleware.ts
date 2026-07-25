import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function queenBeeMiddleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Exclude static files, images, api routes, and the login page itself
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname === '/login' ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check for the Hive Session Cookie
  const sessionCookie = request.cookies.get('hive_session');

  if (!sessionCookie) {
    // If not authenticated, force them to the Queen Bee Paywall/Login
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If authenticated, let them proceed
  return NextResponse.next();
}
