"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        router.push("/auth/signin?message=Compte créé avec succès");
      } else {
        const data = await response.json();
        setError(data.error || "Une erreur s'est produite");
      }
    } catch (error) {
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
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
                Créer un compte
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Rejoignez Klarity pour gérer vos contrats
              </Typography>
            </Box>
          </Stack>

          {/* Card */}
          <Card sx={{ width: "100%", maxWidth: 480 }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Inscription
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Créez votre compte pour commencer
                  </Typography>
                </Box>

                {/* Form */}
                <Stack component="form" onSubmit={handleSubmit} spacing={3}>
                  {error && (
                    <Alert severity="error" sx={{ width: "100%" }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Nom complet"
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    placeholder="jean@example.com"
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
                    autoComplete="new-password"
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading}
                  >
                    {loading ? "Création..." : "Créer mon compte"}
                  </Button>
                </Stack>

                <Box textAlign="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    component="span"
                  >
                    Déjà un compte ?{" "}
                  </Typography>
                  <MuiLink
                    component={Link}
                    href="/auth/signin"
                    underline="hover"
                    fontWeight={600}
                  >
                    Se connecter
                  </MuiLink>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
