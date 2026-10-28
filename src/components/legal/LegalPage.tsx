import Link from "next/link";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { slugify } from "@/modules/categories/model";

export interface LegalSection {
  title: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  intro: string;
  sections: LegalSection[];
  updatedAt: string;
}

const DOCUMENTS = [
  { label: "Conditions d'utilisation", href: "/conditions" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Support", href: "/support" },
];

// Coquille commune aux pages Confidentialité et Conditions : un sommaire
// à gauche, une colonne de lecture à droite. Le bandeau d'avertissement est
// volontaire : ces textes sont des brouillons de travail, pas des documents
// opposables.
export default function LegalPage({
  title,
  intro,
  sections,
  updatedAt,
}: LegalPageProps) {
  const withIds = sections.map((s) => ({ ...s, id: slugify(s.title) }));

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, maxWidth: 1100, mx: "auto", width: "100%", boxSizing: "border-box" }}>
      <Button
        component={Link}
        href="/calendar"
        color="inherit"
        size="small"
        sx={{ mb: 2, color: "text.secondary" }}
      >
        ← Retour à l&apos;application
      </Button>

      <Stack direction="row" flexWrap="wrap" gap={{ xs: 3, md: 6 }} alignItems="flex-start">
        <Box
          component="nav"
          aria-label="Sommaire"
          sx={{ flex: "1 1 220px", maxWidth: { md: 240 }, position: { md: "sticky" }, top: { md: 24 } }}
        >
          <Stack spacing={0.25}>
            {withIds.map((s) => (
              <Box
                key={s.id}
                component="a"
                href={`#${s.id}`}
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  fontSize: 14,
                  color: "text.secondary",
                  textDecoration: "none",
                  "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                }}
              >
                {s.title}
              </Box>
            ))}
          </Stack>
          <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary", mt: 3, mb: 1, px: 1.5 }}>
            Voir aussi
          </Typography>
          <Stack spacing={0.25}>
            {DOCUMENTS.filter((d) => d.label !== title).map((d) => (
              <Box
                key={d.href}
                component={Link}
                href={d.href}
                sx={{ px: 1.5, py: 1, borderRadius: 1, fontSize: 14, color: "primary.dark", ".dark &": { color: "primary.light" } }}
              >
                {d.label}
              </Box>
            ))}
          </Stack>
        </Box>

        <Box
          component="article"
          sx={{
            flex: "999 1 420px",
            minWidth: 0,
            maxWidth: 680,
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            p: { xs: 2.5, md: 4.5 },
          }}
        >
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Dernière mise à jour : {updatedAt}
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: 26, md: 30 },
              letterSpacing: "-0.02em",
              textWrap: "balance",
              mt: 0.75,
            }}
          >
            {title}
          </Typography>

          <Alert severity="warning" sx={{ my: 3 }}>
            Version provisoire, rédigée pour poser la structure. Elle n&apos;a pas
            été relue juridiquement et ne doit pas être considérée comme
            contractuelle en l&apos;état.
          </Alert>

          <Typography sx={{ lineHeight: 1.7, fontSize: 15 }}>{intro}</Typography>

          <Stack spacing={3.5} sx={{ mt: 4 }}>
            {withIds.map((section) => (
              <Box key={section.id} id={section.id} sx={{ scrollMarginTop: 24 }}>
                <Typography component="h2" sx={{ fontWeight: 600, fontSize: 17, mb: 1 }}>
                  {section.title}
                </Typography>
                <Stack spacing={1.25}>
                  {section.body.map((paragraph, i) => (
                    <Typography key={i} sx={{ lineHeight: 1.7, fontSize: 15, color: "text.secondary" }}>
                      {paragraph}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
