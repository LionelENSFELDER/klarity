import Link from "next/link";
import { Alert, Box, Button, Container, Stack, Typography } from "@mui/material";

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

// Coquille commune aux pages Confidentialité, Conditions et Support.
// Le bandeau d'avertissement est volontaire : ces textes sont des
// brouillons de travail, pas des documents opposables.
export default function LegalPage({
  title,
  intro,
  sections,
  updatedAt,
}: LegalPageProps) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
      <Button
        component={Link}
        href="/calendar"
        color="inherit"
        size="small"
        sx={{ mb: 2, color: "text.secondary", textTransform: "none" }}
      >
        ← Retour à l&apos;application
      </Button>

      <Typography
        component="h1"
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: { xs: 26, md: 32 },
          letterSpacing: "-0.025em",
          textWrap: "balance",
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 12.5, mt: 0.75 }}>
        Dernière mise à jour : {updatedAt}
      </Typography>

      <Alert severity="warning" sx={{ my: 3 }}>
        Version provisoire, rédigée pour poser la structure. Elle n&apos;a pas
        été relue juridiquement et ne doit pas être considérée comme
        contractuelle en l&apos;état.
      </Alert>

      <Typography sx={{ lineHeight: 1.7, color: "#cbd5e1", maxWidth: "68ch" }}>
        {intro}
      </Typography>

      <Stack spacing={3.5} sx={{ mt: 4 }}>
        {sections.map((section) => (
          <Box key={section.title}>
            <Typography
              component="h2"
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 16,
                mb: 1,
              }}
            >
              {section.title}
            </Typography>
            <Stack spacing={1.25}>
              {section.body.map((paragraph, i) => (
                <Typography
                  key={i}
                  sx={{ lineHeight: 1.7, color: "#cbd5e1", maxWidth: "68ch" }}
                >
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
