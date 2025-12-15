import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { Providers } from "@/components/providers";
import { Box } from "@mui/material";

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
    <html lang="fr">
      <body>
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
      </body>
    </html>
  );
}
