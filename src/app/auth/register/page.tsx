"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import Link from "next/link";
import {
  PASSWORD_MIN_LENGTH,
  REGISTRATION_SUCCESS_MESSAGE,
} from "@/modules/auth/registration";

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
        router.push(
          `/auth/signin?message=${encodeURIComponent(REGISTRATION_SUCCESS_MESSAGE)}`,
        );
      } else {
        const data = await response.json();
        setError(data.error || "Une erreur s'est produite");
      }
    } catch {
      setError("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  };

  const longEnough = password.length >= PASSWORD_MIN_LENGTH;

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Gratuit. Ajoutez votre premier contrat en une minute."
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={2.25}>
        {error && <Alert severity="error">{error}</Alert>}

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

        <PasswordField
          fullWidth
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          slotProps={{ htmlInput: { minLength: PASSWORD_MIN_LENGTH, "aria-describedby": "password-rule" } }}
        />
        <Stack
          id="password-rule"
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mt: "-8px !important", fontSize: 13, color: longEnough ? "success.dark" : "text.secondary" }}
        >
          {longEnough ? <CheckIcon sx={{ fontSize: 16 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 14 }} />}
          <span>{PASSWORD_MIN_LENGTH} caractères minimum</span>
        </Stack>

        <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
          En créant un compte, vous acceptez les{" "}
          <MuiLink component={Link} href="/conditions">conditions d&apos;utilisation</MuiLink>{" "}
          et la{" "}
          <MuiLink component={Link} href="/confidentialite">politique de confidentialité</MuiLink>.
        </Typography>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !longEnough}
          sx={{ borderRadius: 999, minHeight: 50, fontSize: 15 }}
        >
          {loading ? "Création..." : "Créer mon compte"}
        </Button>
      </Stack>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" component="span">
          Déjà inscrit ?{" "}
        </Typography>
        <MuiLink component={Link} href="/auth/signin" underline="hover" fontWeight={600}>
          Se connecter
        </MuiLink>
      </Box>
    </AuthLayout>
  );
}
