import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ALLOWED_PRODUCTION_EMAILS } from './lib/environment';

export async function middleware(request) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const path = request.nextUrl.pathname;
  const isPublicPath = ['/login', '/signup', '/password-reset', '/complete-profile'].includes(path);

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Block unauthorized emails
    if (token && !ALLOWED_PRODUCTION_EMAILS.includes(token.email)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Additional production checks (e.g., subscription status)
    if (token && !token.subscribed && !['/subscription', '/login'].includes(path)) {
      return NextResponse.redirect(new URL('/subscription', request.url));
    }
  }

  // Authentication redirects
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/privacy/:path*',
    '/login',
    '/signup',
    '/password-reset',
    '/subscription',
    '/complete-profile'
  ]
};