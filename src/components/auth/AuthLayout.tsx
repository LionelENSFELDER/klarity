import Link from "next/link";
import { Box, Stack, Typography } from "@mui/material";
import Logo from "@/components/layout/Logo";

const LEGAL = [
  { label: "Conditions", href: "/conditions" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Support", href: "/support" },
];

const STEPS = [
  { title: "Ajoutez vos contrats", text: "Montant, fréquence et jour de prélèvement. Rien de plus." },
  { title: "Rangez-les par catégorie", text: "Logement, énergie, abonnements : vous choisissez." },
  { title: "Voyez venir", text: "Calendrier du mois, projection sur 12 mois, renouvellements." },
];

/**
 * Coquille des pages d'authentification : le formulaire à gauche, centré,
 * et un panneau de présentation à droite, masqué sur petit écran.
 */
export default function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", minHeight: "100%", bgcolor: "background.default" }}>
      <Stack sx={{ flex: "1 1 480px", minWidth: 0, px: { xs: 2.5, sm: 6 }, py: 4 }}>
        <Logo withName />

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", py: 5 }}>
          <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 400 }}>
            <Box>
              <Typography component="h1" sx={{ fontSize: 34, fontWeight: 400, letterSpacing: "-0.02em" }}>
                {title}
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 15, mt: 1 }}>
                {subtitle}
              </Typography>
            </Box>
            {children}
          </Stack>
        </Box>

        <Stack component="footer" direction="row" flexWrap="wrap" gap={2.25} sx={{ fontSize: 13, color: "text.secondary" }}>
          <span>© 2026 Klarity</span>
          {LEGAL.map((l) => (
            <Box key={l.href} component={Link} href={l.href} sx={{ color: "text.secondary" }}>
              {l.label}
            </Box>
          ))}
        </Stack>
      </Stack>

      <Stack
        component="aside"
        justifyContent="center"
        spacing={3.5}
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "1 1 480px",
          m: 2,
          p: 7,
          borderRadius: 2,
          bgcolor: "primary.contrastText",
          color: "common.white",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 14, color: "primary.main" }}>
            Vos contrats, en clair
          </Typography>
          <Typography sx={{ fontSize: 38, fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em", mt: 1.5, maxWidth: 460 }}>
            Sachez ce qui part de votre compte, et quand.
          </Typography>
        </Box>
        <Stack component="ol" spacing={1.75} sx={{ m: 0, p: 0, listStyle: "none", maxWidth: 460 }}>
          {STEPS.map((s, i) => (
            <Stack
              key={s.title}
              component="li"
              direction="row"
              spacing={2}
              sx={{ p: 2.25, borderRadius: 1.5, bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.12)" }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  flex: "none",
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 500,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {i + 1}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 500, fontSize: 16 }}>{s.title}</Typography>
                <Typography sx={{ color: "primary.light", lineHeight: 1.5 }}>{s.text}</Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
