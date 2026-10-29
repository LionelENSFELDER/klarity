"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
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
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordField from "@/components/auth/PasswordField";
import { ACTION_FAILED, EMAIL_NOT_VERIFIED, TOO_MANY_ATTEMPTS } from "@/lib/messages";
import { ResendVerification } from "@/modules/auth/verifyActions";

const pill = { borderRadius: 1, minHeight: 50, fontSize: 15 } as const;

function SignInContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // Message posé par la page d'inscription après création du compte.
  const params = useSearchParams();
  const notice = params.get("message");
  // Posé par une page qui n'a pas pu lire la session.
  const expired = params.get("session") === "expiree";
  const [loading, setLoading] = useState(false);
  // Adresse pas encore confirmée : on propose de renvoyer le lien.
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();

  const resend = async () => {
    const result = await ResendVerification(email).catch(() => ({ error: ACTION_FAILED }));
    if ("error" in result) setError(result.error);
    else setResent(true);
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);
    setResent(false);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error === "CredentialsSignin") {
        // Un compte créé via Google n'a pas de mot de passe : même refus.
        setError(
          "Email ou mot de passe incorrect. Si vous avez créé votre compte avec Google, utilisez « Continuer avec Google ».",
        );
      } else if (result?.error === EMAIL_NOT_VERIFIED) {
        setUnverified(true);
      } else if (result?.error === TOO_MANY_ATTEMPTS) {
        setError("Trop de tentatives. Patientez 15 minutes avant de réessayer.");
      } else if (result?.error) {
        setError("Connexion impossible pour le moment. Réessayez dans un instant.");
      } else {
        // refresh : le layout racine (header, menu mobile) a été rendu sans
        // session et n'est pas re-rendu par une simple navigation client.
        router.replace("/calendar");
        router.refresh();
      }
    } catch {
      setError("Connexion impossible. Vérifiez votre connexion internet et réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/calendar" });
  };

  return (
    <AuthLayout
      title="Bon retour"
      subtitle="Connectez-vous pour voir vos prochains prélèvements."
    >
      <Stack component="form" onSubmit={handleCredentialsSubmit} spacing={2.25}>
        {notice && !error && <Alert severity="success">{notice}</Alert>}
        {expired && !notice && !error && (
          <Alert severity="info">Votre session a expiré. Reconnectez-vous.</Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {unverified && (
          <Alert
            severity="warning"
            action={
              !resent && (
                <Button color="inherit" size="small" onClick={resend}>
                  Renvoyer le lien
                </Button>
              )
            }
          >
            {resent
              ? "Lien renvoyé. Ouvrez-le depuis votre boîte mail, puis reconnectez-vous."
              : "Confirmez d'abord votre adresse avec le lien reçu par e-mail."}
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

        <PasswordField
          fullWidth
          label="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          error={Boolean(error)}
        />
        <Box sx={{ mt: "-8px !important", textAlign: "right" }}>
          <MuiLink component={Link} href="/auth/mot-de-passe-oublie" underline="hover" fontSize={14}>
            Mot de passe oublié ?
          </MuiLink>
        </Box>

        <Button type="submit" variant="contained" fullWidth disabled={loading} sx={pill}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </Stack>

      <Divider>
        <Typography variant="caption" color="text.secondary">
          OU
        </Typography>
      </Divider>

      <Button
        onClick={handleGoogleSignIn}
        variant="outlined"
        color="inherit"
        fullWidth
        startIcon={<GoogleIcon />}
        sx={{ ...pill, borderColor: "divider" }}
      >
        Continuer avec Google
      </Button>

      <Box textAlign="center">
        <Typography variant="body2" color="text.secondary" component="span">
          Pas encore de compte ?{" "}
        </Typography>
        <MuiLink component={Link} href="/auth/register" underline="hover" fontWeight={600}>
          Créer un compte
        </MuiLink>
      </Box>
    </AuthLayout>
  );
}

// useSearchParams impose une frontière Suspense — même motif que
// src/app/auth/error/page.tsx.
export default function SignInPage() {
  return (
    <Suspense>
      <SignInContent />
    </Suspense>
  );
}
