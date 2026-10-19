import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
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
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <AppRouterCacheProvider>
          <Providers>
            {/* La coquille occupe exactement la hauteur de l'écran et ne
                défile pas : le footer reste donc toujours visible, et chaque
                zone (rail, contenu) gère son propre défilement.
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
              <Footer />
            </Box>
          </Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
