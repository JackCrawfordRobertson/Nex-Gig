// middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request) {
  // Get the token with proper secret
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  const path = request.nextUrl.pathname;
  
  // Define public paths and paths that don't require subscription
  const isPublicPath = ['/login', '/signup', '/password-reset', '/complete-profile'].includes(path);
  const subscriptionPaths = ['/subscription', '/login'];
  
  // Define all private paths
  const privateRoutes = [
    '/dashboard',
    '/profile-settings',
    '/ifyoucould',
    '/linkedin',
    '/unjobs',
    '/workable'
  ];
  
  // Skip middleware checks for the session refresh API route
  if (path === '/api/auth/session-refresh') {
    return NextResponse.next();
  }
  
  // Check if the current path is a private route
  const isPrivatePath = privateRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Redirect to login if trying to access private routes without authentication
  if (isPrivatePath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Block unauthorized emails in production
    const ALLOWED_PRODUCTION_EMAILS = [
      'jack@ya-ya.co.uk',
      // Add other authorized emails
    ];
    
    if (token && !ALLOWED_PRODUCTION_EMAILS.includes(token.email)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check for subscription on private routes
    if (isPrivatePath && token && !token.subscribed && !subscriptionPaths.includes(path)) {
      return NextResponse.redirect(new URL('/subscription', request.url));
    }
  }
  
  // Redirect authenticated users from public paths
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/profile-settings',
    '/ifyoucould/:path*',
    '/linkedin/:path*',
    '/unjobs/:path*',
    '/workable/:path*',
    '/login',
    '/signup',
    '/password-reset',
    '/subscription',
    '/complete-profile',
    '/api/auth/session-refresh'  // Add this route to the matcher
  ]
};