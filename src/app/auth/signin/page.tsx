"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Divider,
  Alert,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: { xs: 6, md: 12 },
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={4} alignItems="center">
          {/* Logo & Title */}
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: 2,
              }}
            >
              <Typography variant="h4" sx={{ color: "white" }}>
                📋
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Bienvenue sur Klarity
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Gérez tous vos contrats en un seul endroit
              </Typography>
            </Box>
          </Stack>

          {/* Card */}
          <Card sx={{ width: "100%", maxWidth: 480 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Connexion
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choisissez votre méthode de connexion préférée
                  </Typography>
                </Box>

                {/* Form */}
                <Stack
                  component="form"
                  onSubmit={handleCredentialsSubmit}
                  spacing={3}
                >
                  {error && (
                    <Alert severity="error" sx={{ width: "100%" }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />

                  <TextField
                    fullWidth
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "Connexion..." : "Se connecter"}
                  </Button>
                </Stack>

                <Divider>
                  <Typography variant="caption" color="text.secondary">
                    OU
                  </Typography>
                </Divider>

                {/* Google Sign In */}
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outlined"
                  size="large"
                  fullWidth
                  startIcon={<GoogleIcon />}
                >
                  Continuer avec Google
                </Button>

                <Box textAlign="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    Pas encore de compte ?{" "}
                  </Typography>
                  <MuiLink
                    component={Link}
                    href="/auth/register"
                    underline="hover"
                    fontWeight={600}
                  >
                    S'inscrire
                  </MuiLink>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Footer Text */}
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            maxWidth={400}
          >
            En vous connectant, vous acceptez nos{" "}
            <MuiLink href="#" underline="hover">
              conditions d'utilisation
            </MuiLink>{" "}
            et notre{" "}
            <MuiLink href="#" underline="hover">
              politique de confidentialité
            </MuiLink>
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
