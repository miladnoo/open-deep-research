import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Allow server actions while auth is disabled
export function middleware(request: NextRequest) {
  // Get the pathname and hostname
  const { pathname } = new URL(request.url);
  const hostname = request.headers.get('x-forwarded-host') || request.headers.get('host');

  // Special handling for server actions in GitHub Codespace
  if (request.method === 'POST' && pathname === '/') {
    const response = NextResponse.next();
    
    // Set headers for GitHub Codespace compatibility
    response.headers.set('x-middleware-next', '1');
    
    if (hostname?.includes('app.github.dev')) {
      // Use the forwarded host as origin for GitHub Codespace
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      response.headers.set('origin', `${protocol}://${hostname}`);
    }
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
