"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Alert,
  Chip,
  Divider,
  Box,
  Typography,
} from "@mui/material";
import Link from "next/link";

const errors = {
  Configuration: "Il y a un problème avec la configuration du serveur.",
  AccessDenied:
    "Accès refusé. Vous n'avez pas l'autorisation d'accéder à cette application.",
  Verification: "Le token de vérification a expiré ou a déjà été utilisé.",
  Default: "Une erreur inattendue s'est produite.",
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as keyof typeof errors;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #fef2f2 0%, #ffffff 50%, #fff1f2 100%)",
        py: { xs: 6, sm: 12 },
        px: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Box sx={{ maxWidth: "28rem", width: "100%" }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Box
            sx={{
              mx: "auto",
              height: 64,
              width: 64,
              background: "linear-gradient(135deg, #ef4444 0%, #f43f5e 100%)",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 3,
              boxShadow: 3,
            }}
          >
            <Typography sx={{ fontSize: "1.5rem" }}>❌</Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Erreur de connexion
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Un problème est survenu lors de l&apos;authentification
          </Typography>
        </Box>

        {/* Main Card */}
        <Card sx={{ boxShadow: 6, mb: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>🚫</span>
                <Typography
                  variant="h6"
                  component="span"
                  sx={{ fontWeight: 600, color: "error.main" }}
                >
                  Connexion échouée
                </Typography>
              </Box>
            }
            subheader={
              <Typography variant="body1" sx={{ mt: 1 }}>
                {errors[error] || errors.Default}
              </Typography>
            }
            sx={{ pb: 3 }}
          />

          <CardContent
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            {/* Error Alert */}
            <Alert severity="error" icon="ℹ️">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Solutions recommandées :
                </Typography>
                <Box component="ul" sx={{ fontSize: "0.875rem", pl: 3, m: 0 }}>
                  <li>Vérifiez votre connexion internet</li>
                  <li>Réessayez de vous connecter</li>
                  <li>Videz le cache de votre navigateur</li>
                  <li>Contactez le support si le problème persiste</li>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                  }}
                >
                  <Button
                    component={Link}
                    href="/auth/signin"
                    variant="contained"
                    fullWidth
                    sx={{ height: 44 }}
                  >
                    <span style={{ marginRight: 8 }}>🔄</span>
                    Réessayer la connexion
                  </Button>
                  <Button
                    component={Link}
                    href="/"
                    variant="outlined"
                    fullWidth
                    sx={{ height: 44 }}
                  >
                    <span style={{ marginRight: 8 }}>🏠</span>
                    Retour à l&apos;accueil
                  </Button>
                </Box>
              </Box>
            </Alert>

            <Divider />

            <Alert severity="info" icon="🔧">
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    Debug Info
                  </Typography>
                  <Chip label="Development" size="small" variant="outlined" />
                </Box>
                <Box sx={{ bgcolor: "grey.100", borderRadius: 1, p: 2 }}>
                  <Typography
                    component="code"
                    sx={{ fontSize: "0.75rem", display: "block" }}
                  >
                    Error Code: {error || "Unknown"}
                  </Typography>
                  <Typography
                    component="code"
                    sx={{ fontSize: "0.75rem", display: "block", mt: 0.5 }}
                  >
                    Timestamp: {new Date().toISOString()}
                  </Typography>
                </Box>
              </Box>
            </Alert>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card
          sx={{
            background: "linear-gradient(90deg, #eff6ff 0%, #eef2ff 100%)",
          }}
        >
          <CardContent sx={{ pt: 3 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 500, color: "primary.dark", mb: 1 }}
              >
                Besoin d&apos;aide ?
              </Typography>
              <Typography variant="body2" sx={{ color: "primary.dark", mb: 2 }}>
                Si le problème persiste, voici quelques ressources utiles
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Chip
                  label="📧 Support technique"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label="📚 Documentation"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label="💬 Chat en ligne"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
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
