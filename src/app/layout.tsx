import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Klarity - Gestion de contrats simplifiée",
  description: "Gérez tous vos contrats et abonnements en un seul endroit",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      // Le script ci-dessous pose la classe du thème avant hydratation.
      suppressHydrationWarning
      className={inter.variable}
    >
      <body>
        <InitColorSchemeScript attribute="class" defaultMode="system" />
        <AppRouterCacheProvider>
          <Providers>
            {/* La coquille occupe exactement la hauteur de l'écran et ne
                défile pas : chaque zone (rail, contenu) gère son propre
                défilement.
                dvh plutôt que vh : sur mobile, vh ignore la barre d'URL. */}
            <Box
              sx={{
                height: ["100vh", "100dvh"],
                overflow: "hidden",
                bgcolor: "background.default",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Header />
              {/* minWidth/minHeight 0 : le rail et la liste gèrent leur
                  propre défilement sans forcer la largeur de la page.
                  overflow auto sert de filet aux pages qui n'ont pas leur
                  propre conteneur de défilement (mentions légales, auth). */}
              <Box
                component="main"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  minHeight: 0,
                  overflow: "auto",
                }}
              >
                {children}
              </Box>
            </Box>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
