import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function registryResponse(request: NextRequest, response: NextResponse) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-ud-registry', '1')
  return NextResponse.next({
    request: { headers: requestHeaders },
    headers: response.headers,
    status: response.status,
  })
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl
  const onRegistryHost = host.startsWith('registry.')
  const onRegistryPath = pathname.startsWith('/registry')

  if (onRegistryHost) {
    if (pathname.startsWith('/registry')) {
      const url = request.nextUrl.clone()
      url.pathname = pathname.slice('/registry'.length) || '/'
      return NextResponse.redirect(url)
    }

    const url = request.nextUrl.clone()
    url.pathname = pathname === '/' ? '/registry' : `/registry${pathname}`
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-ud-registry', '1')
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } })
  }

  if (onRegistryPath) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-ud-registry', '1')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icons|whitepaper|demos|scenarios).*)'],
}
