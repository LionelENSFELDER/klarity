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
            <Box
              sx={{
                minHeight: "100vh",
                bgcolor: "background.default",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Header />
              <Box component="main" sx={{ flex: 1 }}>
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
