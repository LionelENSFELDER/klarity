import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Routes publiques
  const isPublicRoute =
    nextUrl.pathname.startsWith("/auth") ||
    nextUrl.pathname === "/" ||
    nextUrl.pathname.startsWith("/api/auth");

  // Routes protégées (dashboard, etc.)
  const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard");

  // Si pas connecté et essaie d'accéder à une route protégée
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl.origin));
  }

  // Si connecté et essaie d'accéder à la page de login
  if (isLoggedIn && nextUrl.pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
