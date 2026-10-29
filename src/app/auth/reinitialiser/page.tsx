"use client";

import { Suspense, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Box, Button, Link as MuiLink, Stack } from "@mui/material";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import { ResetPassword } from "@/modules/auth/password";
import { PASSWORD_MIN_LENGTH } from "@/modules/auth/registration";
import { ACTION_FAILED } from "@/lib/messages";

function ResetContent() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await ResetPassword(token, password).catch(() => ({ error: ACTION_FAILED }));
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.push(
        `/auth/signin?message=${encodeURIComponent("Mot de passe modifié. Connectez-vous avec le nouveau.")}`,
      );
    });
  };

  return (
    <AuthLayout title="Nouveau mot de passe" subtitle="Toutes vos sessions ouvertes seront fermées.">
      {!token ? (
        <Alert severity="error">
          Ce lien est incomplet. Ouvrez celui reçu par e-mail, ou demandez-en un nouveau.
        </Alert>
      ) : (
        <Stack component="form" onSubmit={submit} spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}
          <PasswordField
            fullWidth
            label="Nouveau mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            helperText={`${PASSWORD_MIN_LENGTH} caractères minimum`}
            slotProps={{ htmlInput: { minLength: PASSWORD_MIN_LENGTH } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={pending || password.length < PASSWORD_MIN_LENGTH}
            sx={{ minHeight: 50, fontSize: 15 }}
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </Stack>
      )}
      <Box textAlign="center">
        <MuiLink component={Link} href="/auth/mot-de-passe-oublie" underline="hover" fontWeight={600}>
          Demander un nouveau lien
        </MuiLink>
      </Box>
    </AuthLayout>
  );
}

// useSearchParams impose une frontière Suspense (voir auth/signin).
export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetContent />
    </Suspense>
  );
}
