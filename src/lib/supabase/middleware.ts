import { NextResponse, type NextRequest } from 'next/server';

// Simple middleware - authentication is handled client-side with localStorage
export async function updateSession(request: NextRequest) {
  // Public routes that don't require authentication check
  const publicRoutes = ['/', '/login'];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // For public routes, just continue
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, allow access (auth is checked client-side)
  return NextResponse.next();
}
