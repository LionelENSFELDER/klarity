import type { Metadata } from "next";
import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import ReportIcon from "@mui/icons-material/ReportProblemOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";

export const metadata: Metadata = {
  title: "Support — Klarity",
};

const SUPPORT_EMAIL = "ensfelder.lionel+klarity@gmail.com";

const linkSx ={ color: "primary.dark", ".dark &": { color: "primary.light" } } as const;

const cardSx = {
  flex: "1 1 280px",
  minWidth: 0,
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  p: 2.75,
} as const;

function CardIcon({ children, tone }: { children: React.ReactNode; tone: "primary" | "error" | "info" }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1,
        display: "grid",
        placeItems: "center",
        bgcolor: `rgba(var(--mui-palette-${tone}-mainChannel) / 0.14)`,
        color: `${tone}.dark`,
      }}
    >
      {children}
    </Box>
  );
}

export default function SupportPage() {
  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 }, maxWidth: 1100, mx: "auto", width: "100%", boxSizing: "border-box" }}>
      <Button component={Link} href="/calendar" color="inherit" size="small" sx={{ mb: 2, color: "text.secondary" }}>
        ← Retour à l&apos;application
      </Button>

      <Stack spacing={1} sx={{ maxWidth: 720, mb: 3 }}>
        <Box
          component="span"
          sx={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 600, px: 1.25, py: 0.4, borderRadius: 1, bgcolor: "warning.light", color: "warning.contrastText" }}
        >
          Version alpha
        </Box>
        <Typography component="h1" sx={{ fontWeight: 700, fontSize: { xs: 26, md: 30 }, letterSpacing: "-0.02em" }}>
          Support
        </Typography>
        <Typography sx={{ fontSize: 15, lineHeight: 1.55, color: "text.secondary" }}>
          Klarity est en alpha : les bugs font partie du décor. Voici quoi faire
          quand quelque chose coince.
        </Typography>
      </Stack>

      <Stack direction="row" flexWrap="wrap" gap={2}>
        <Stack spacing={1.75} sx={cardSx}>
          <CardIcon tone="primary"><FactCheckIcon /></CardIcon>
          <Typography component="h2" sx={{ fontWeight: 600, fontSize: 17 }}>
            Avant de signaler
          </Typography>
          <Stack component="ol" spacing={1.5} sx={{ m: 0, p: 0, listStyle: "none" }}>
            {[
              "Rechargez la page : l'essentiel de l'affichage est recalculé à chaque chargement, ce qui suffit souvent.",
              "Vérifiez la saisie du contrat concerné — fréquence, jour de prélèvement, mois de référence pour un contrat trimestriel ou annuel. Une échéance qui n'apparaît pas vient le plus souvent de là.",
              "Une échéance annuelle n'est visible que si l'horizon est assez large : passez le sélecteur à 12 mois.",
            ].map((t, i) => (
              <Stack key={i} component="li" direction="row" spacing={1.25}>
                <Box sx={{ width: 22, height: 22, flex: "none", borderRadius: "50%", bgcolor: "action.hover", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center" }}>
                  {i + 1}
                </Box>
                <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: "text.secondary" }}>{t}</Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={1.75} sx={cardSx}>
          <CardIcon tone="error"><ReportIcon /></CardIcon>
          <Typography component="h2" sx={{ fontWeight: 600, fontSize: 17 }}>
            Signaler un problème
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: "text.secondary" }}>
            Indiquez ce que vous faisiez, ce que vous attendiez, et ce qui
            s&apos;est passé à la place. Une capture d&apos;écran et le nom du
            contrat concerné suffisent dans la plupart des cas.
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Button
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Klarity — signalement")}`}
            variant="contained"
            sx={{ borderRadius: 1, minHeight: 46 }}
          >
            Écrire au support
          </Button>
          <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center", wordBreak: "break-all" }}>
            {SUPPORT_EMAIL}
          </Typography>
        </Stack>

        <Stack spacing={1.75} sx={cardSx}>
          <CardIcon tone="info"><LockIcon /></CardIcon>
          <Typography component="h2" sx={{ fontWeight: 600, fontSize: 17 }}>
            Demandes sur vos données
          </Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: "text.secondary" }}>
            Export ou suppression de compte : écrivez à la même adresse en
            précisant l&apos;e-mail de votre compte, en attendant que ces
            actions soient disponibles directement dans l&apos;application.
          </Typography>
        </Stack>
      </Stack>

      <Box
        component="section"
        aria-labelledby="limites"
        sx={{ mt: 2, p: 2.75, borderRadius: 1, border: 1, borderColor: "rgba(var(--mui-palette-warning-mainChannel) / 0.45)", bgcolor: "rgba(var(--mui-palette-warning-mainChannel) / 0.08)" }}
      >
        <Typography id="limites" component="h2" sx={{ fontWeight: 600, fontSize: 15, mb: 1 }}>
          Limites connues
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.75, lineHeight: 1.6, fontSize: 14 }}>
          <li>
            L&apos;import de documents PDF a été retiré : les fichiers étaient
            stockés sans qu&apos;aucun écran ne permette de les relire. La
            fonctionnalité reviendra avec une vraie consultation.
          </li>
          <li>
            Aucune notification n&apos;est encore envoyée avant une échéance :
            la cloche de l&apos;interface est un emplacement réservé.
          </li>
        </Box>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 3, fontSize: 14 }}>
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>Pages légales :</Typography>
        <Box component={Link} href="/conditions" sx={linkSx}>Conditions d&apos;utilisation</Box>
        <Box component={Link} href="/confidentialite" sx={linkSx}>Confidentialité</Box>
      </Stack>
    </Box>
  );
}
