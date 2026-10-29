"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { Alert, Box, Button, Link as MuiLink, Stack, TextField, Typography } from "@mui/material";
import PasswordField from "@/components/auth/PasswordField";
import { ChangePassword } from "@/modules/auth/password";
import { PASSWORD_MIN_LENGTH } from "@/modules/auth/registration";
import { DeleteAccount, SignOutEverywhere } from "@/modules/account/actions";
import { ACTION_FAILED } from "@/lib/messages";

const cardSx = {
  bgcolor: "background.paper",
  borderRadius: 2,
  p: { xs: 2, sm: 2.75 },
} as const;

/** Changement de mot de passe ; ferme ensuite toutes les sessions. */
function PasswordCard({ hasPassword }: { hasPassword: boolean }) {
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await ChangePassword(current, next).catch(() => ({ error: ACTION_FAILED }));
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await signOut({
        callbackUrl: `/auth/signin?message=${encodeURIComponent("Mot de passe modifié. Reconnecte-toi avec le nouveau.")}`,
      });
    });
  };

  return (
    <Stack spacing={1.25} sx={cardSx}>
      <Typography component="h2" sx={{ fontWeight: 400, fontSize: 21 }}>
        Mot de passe
      </Typography>
      {hasPassword ? (
        <Stack component="form" onSubmit={submit} spacing={1.5} sx={{ maxWidth: 420 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <PasswordField
            label="Mot de passe actuel"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            autoComplete="current-password"
            size="small"
          />
          <PasswordField
            label="Nouveau mot de passe"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            autoComplete="new-password"
            size="small"
            helperText={`${PASSWORD_MIN_LENGTH} caractères minimum. Toutes les sessions seront fermées.`}
          />
          <Box>
            <Button
              type="submit"
              variant="outlined"
              disabled={pending || !current || next.length < PASSWORD_MIN_LENGTH}
            >
              {pending ? "Enregistrement…" : "Changer le mot de passe"}
            </Button>
          </Box>
        </Stack>
      ) : (
        <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
          Tu te connectes avec Google. Pour te connecter aussi par e-mail, définis un mot
          de passe avec{" "}
          <MuiLink component={Link} href="/auth/mot-de-passe-oublie">
            « Mot de passe oublié »
          </MuiLink>
          .
        </Typography>
      )}
    </Stack>
  );
}

/** Ferme les sessions de tous les appareils, celle-ci comprise. */
function SessionsCard() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const signOutEverywhere = () =>
    startTransition(async () => {
      const result = await SignOutEverywhere().catch(() => ({ error: ACTION_FAILED }));
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await signOut({
        callbackUrl: `/auth/signin?message=${encodeURIComponent("Toutes les sessions sont fermées. Reconnecte-toi.")}`,
      });
    });

  return (
    <Stack spacing={1.25} sx={cardSx}>
      <Typography component="h2" sx={{ fontWeight: 400, fontSize: 21 }}>
        Sessions
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
        Un appareil perdu, un ordinateur partagé ? Ferme toutes les sessions
        ouvertes, sur tous les appareils, celle-ci comprise.
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box>
        <Button variant="outlined" disabled={pending} onClick={signOutEverywhere}>
          {pending ? "Déconnexion…" : "Se déconnecter de tous les appareils"}
        </Button>
      </Box>
    </Stack>
  );
}

export default function AccountSettings({
  email,
  hasPassword = true,
}: {
  email: string;
  hasPassword?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  const remove = () =>
    startTransition(async () => {
      const result = await DeleteAccount(typed).catch(() => ({ error: ACTION_FAILED }));
      if ("error" in result) {
        setError(result.error);
        return;
      }
      await signOut({
        callbackUrl: `/auth/signin?message=${encodeURIComponent("Compte supprimé. Merci d'avoir essayé Klarity.")}`,
      });
    });

  return (
    <Stack spacing={2}>
      <Stack spacing={1.25} sx={cardSx}>
        <Typography component="h2" sx={{ fontWeight: 400, fontSize: 21 }}>
          Exporter mes données
        </Typography>
        <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
          Un fichier JSON avec ton compte, tes contrats (archivés compris) et tes
          catégories.
        </Typography>
        <Box>
          <Button variant="outlined" href="/api/account/export" download>
            Télécharger l&apos;export
          </Button>
        </Box>
      </Stack>

      <PasswordCard hasPassword={hasPassword} />

      <SessionsCard />

      <Stack spacing={1.25} sx={{ ...cardSx, borderColor: "error.light" }}>
        <Typography component="h2" sx={{ fontWeight: 400, fontSize: 21 }}>
          Supprimer mon compte
        </Typography>
        <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
          Ton compte, tes contrats et tes catégories sont effacés définitivement.
          Rien ne pourra être récupéré : exporte tes données avant si tu veux les
          garder.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {confirming ? (
          <Stack spacing={1.5}>
            <TextField
              label={`Retape ton e-mail (${email}) pour confirmer`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              size="small"
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="contained"
                color="error"
                disabled={pending || typed.trim().toLowerCase() !== email.toLowerCase()}
                onClick={remove}
              >
                {pending ? "Suppression…" : "Supprimer définitivement"}
              </Button>
              <Button color="inherit" onClick={() => { setConfirming(false); setTyped(""); setError(""); }}>
                Annuler
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Box>
            <Button variant="outlined" color="error" onClick={() => setConfirming(true)}>
              Supprimer mon compte
            </Button>
          </Box>
        )}
      </Stack>
    </Stack>
  );
}
