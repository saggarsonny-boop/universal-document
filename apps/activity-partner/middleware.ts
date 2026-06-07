import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/healthz') {
    return new NextResponse(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/healthz', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
