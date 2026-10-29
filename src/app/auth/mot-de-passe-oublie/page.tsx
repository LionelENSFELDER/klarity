"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Alert, Box, Button, Link as MuiLink, Stack, TextField } from "@mui/material";
import AuthLayout from "@/components/auth/AuthLayout";
import { RequestPasswordReset } from "@/modules/auth/password";
import { ACTION_FAILED } from "@/lib/messages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await RequestPasswordReset(email).catch(() => ({ error: ACTION_FAILED }));
      if ("error" in result) setError(result.error);
      else setSent(true);
    });
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      subtitle="Indiquez votre adresse : nous vous envoyons un lien pour en choisir un nouveau."
    >
      {sent ? (
        // Même message qu'un compte existe ou non : rien ne révèle qui est inscrit.
        <Alert severity="success">
          Si un compte existe pour {email}, un e-mail vient de partir. Le lien est valable une
          heure ; pensez à regarder dans les indésirables.
        </Alert>
      ) : (
        <Stack component="form" onSubmit={submit} spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Button type="submit" variant="contained" fullWidth disabled={pending} sx={{ minHeight: 50, fontSize: 15 }}>
            {pending ? "Envoi…" : "Envoyer le lien"}
          </Button>
        </Stack>
      )}
      <Box textAlign="center">
        <MuiLink component={Link} href="/auth/signin" underline="hover" fontWeight={600}>
          Retour à la connexion
        </MuiLink>
      </Box>
    </AuthLayout>
  );
}
