import { withAuth } from "next-auth/middleware";

// Pas de redirection des pages d'auth quand un jeton est présent : le
// middleware ne lit pas la base, il ne sait pas si la session a été révoquée
// (voir lib/sessionToken), et renvoyer une session révoquée vers /calendar
// bouclerait avec la redirection des pages vers la connexion.
export default withAuth(
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
