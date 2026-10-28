"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmberRounded";
import Link from "next/link";

const errors = {
  Configuration: "Il y a un problème avec la configuration du serveur.",
  AccessDenied:
    "Accès refusé. Vous n'avez pas l'autorisation d'accéder à cette application.",
  Verification: "Le token de vérification a expiré ou a déjà été utilisé.",
  Default: "Une erreur inattendue s'est produite.",
};

const TIPS = [
  "Vérifiez votre connexion internet",
  "Réessayez de vous connecter",
  "Videz le cache de votre navigateur",
  "Contactez le support si le problème persiste",
];

function AuthErrorContent() {
  const error = useSearchParams().get("error") as keyof typeof errors | null;

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: { xs: 6, sm: 12 },
        px: 2,
      }}
    >
      <Stack
        component="section"
        aria-labelledby="auth-error-title"
        spacing={2.25}
        sx={{
          width: "100%",
          maxWidth: 460,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: "rgba(var(--mui-palette-error-mainChannel) / 0.12)",
            color: "error.main",
            display: "grid",
            placeItems: "center",
          }}
        >
          <WarningAmberIcon />
        </Box>
        <Box>
          <Typography id="auth-error-title" component="h1" sx={{ fontSize: 22, fontWeight: 700 }}>
            Une erreur s&apos;est produite
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.75 }}>
            {(error && errors[error]) || errors.Default}
          </Typography>
        </Box>
        <Stack component="ul" spacing={1} sx={{ m: 0, p: 0, listStyle: "none" }}>
          {TIPS.map((t) => (
            <Stack key={t} component="li" direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.dark", flex: "none" }} />
              <Typography sx={{ fontSize: 14 }}>{t}</Typography>
            </Stack>
          ))}
        </Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 0.5 }}>
          <Button
            component={Link}
            href="/auth/signin"
            variant="contained"
            sx={{ flex: 1, borderRadius: 1, minHeight: 46 }}
          >
            Réessayer de se connecter
          </Button>
          <Button
            component={Link}
            href="/support"
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 1, minHeight: 46, px: 3, borderColor: "divider" }}
          >
            Support
          </Button>
        </Stack>
        {error && (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            Code à transmettre au support : {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}
