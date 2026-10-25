import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Si connecté et essaie d'accéder à l'inscription. La page de connexion
    // n'arrive jamais ici : withAuth la laisse passer sans appeler ce code.
    if (
      token?.sub &&
      (pathname === "/auth/signin" || pathname === "/auth/register")
    ) {
      return NextResponse.redirect(new URL("/calendar", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Routes publiques
        if (pathname.startsWith("/auth") || pathname.startsWith("/api/auth")) {
          return true;
        }

        // Routes protégées : un jeton sans identifiant utilisateur ne suffit
        // pas, les pages en ont besoin pour charger les contrats.
        if (
          pathname.startsWith("/calendar") ||
          pathname.startsWith("/reglages") ||
          pathname.startsWith("/tableau-de-bord") ||
          pathname === "/"
        ) {
          return Boolean(token?.sub);
        }

        return true;
      },
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (static files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
