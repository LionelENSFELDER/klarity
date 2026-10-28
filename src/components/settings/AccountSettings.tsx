"use client";

import { useState, useTransition } from "react";
import { signOut } from "next-auth/react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { DeleteAccount } from "@/modules/account/actions";
import { ACTION_FAILED } from "@/lib/messages";

const cardSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: 1,
  p: { xs: 2, sm: 2.75 },
} as const;

export default function AccountSettings({ email }: { email: string }) {
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
        <Typography component="h2" sx={{ fontWeight: 600, fontSize: 16 }}>
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

      <Stack spacing={1.25} sx={{ ...cardSx, borderColor: "error.light" }}>
        <Typography component="h2" sx={{ fontWeight: 600, fontSize: 16 }}>
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
