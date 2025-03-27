import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ALLOWED_PRODUCTION_EMAILS } from './lib/environment';

export async function middleware(request) {
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
    '/privacy',
    '/profile-settings',
    '/ifyoucould',
    '/linkedin',
    '/unjobs',
    '/workable'
  ];

  // Check if the current path is a private route
  const isPrivatePath = privateRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Production-specific checks
  if (process.env.NODE_ENV === 'production') {
    // Block unauthorized emails
    if (token && !ALLOWED_PRODUCTION_EMAILS.includes(token.email)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Check for authentication and subscription on private routes
    if (isPrivatePath) {
      // Redirect to login if not authenticated
      if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      
      // Redirect to subscription if not subscribed
      if (token && !token.subscribed && !subscriptionPaths.includes(path)) {
        return NextResponse.redirect(new URL('/subscription', request.url));
      }
    }
  }

  // General authentication redirects
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
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
    '/privacy/:path*',
    '/profile-settings',
    '/ifyoucould/:path*',
    '/linkedin/:path*',
    '/unjobs/:path*',
    '/workable/:path*',
    '/login',
    '/signup',
    '/password-reset',
    '/subscription',
    '/complete-profile'
  ]
};