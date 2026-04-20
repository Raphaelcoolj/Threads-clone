import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Define route matchers
const isOnboardingRoute = (pathname: string) => pathname.startsWith("/onboarding");
const isPublicRoute = (pathname: string) => 
  pathname.startsWith("/login") || 
  pathname.startsWith("/sign-up") || // 🛡️ ENHANCED SYNC: Trust 'username' or 'name' as fallbacks.
  pathname.startsWith("/api/uploadthing") ||
  pathname.startsWith("/api/auth") ;
  // pathname.startsWith("/communities");

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  console.log(`[MIDDLEWARE] Checking path: ${req.nextUrl.pathname}, Auth: ${!!req.auth}`);
  
  // Only trust the explicit onboarded flag.
  const isFinishedOnboarding = req.auth?.user?.onboarded === true;

  // 1. If user is Authenticated and tries to go to Login/Sign-up, send them Home
  if (isAuthenticated && (nextUrl.pathname === "/login" || nextUrl.pathname === "/sign-up")) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // 2. For users visiting /onboarding, don't try to redirect anywhere else
  if (isAuthenticated && isOnboardingRoute(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // 3. If the user isn't signed in and the route is private, redirect to sign-in
  if (!isAuthenticated && !isPublicRoute(nextUrl.pathname)) {
    const loginUrl = new URL("/login", nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
