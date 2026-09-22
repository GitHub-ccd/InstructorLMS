import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static Next.js assets, avatar images, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/avatars') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/signin'
  ) {
    return NextResponse.next();
  }

  // 2. Check for active instructor session cookie
  const activeInstructorId = request.cookies.get('active_instructor_id')?.value;

  // 3. If unauthenticated, redirect to signin
  if (!activeInstructorId) {
    const signInUrl = new URL('/signin', request.url);
    if (pathname !== '/') {
      signInUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - avatars (avatar image files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|avatars|favicon.ico).*)',
  ],
};
