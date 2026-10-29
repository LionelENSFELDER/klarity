"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmberRounded";
import StatusCard from "@/components/ui/StatusCard";
import { reportError } from "@/lib/reportError";

// En production, Next masque le message d'une erreur serveur : seul le digest
// permet de la retrouver dans les logs.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
    reportError(error);
  }, [error]);

  return (
    <StatusCard
      icon={<WarningAmberIcon />}
      tone="error"
      title="Quelque chose s'est mal passé"
      message="Tes données ne sont pas perdues. Réessaie ; si le problème revient, ta session a peut-être expiré : reconnecte-toi."
      actions={
        <>
          <Button onClick={reset} variant="contained" sx={{ flex: 1, borderRadius: 1, minHeight: 46 }}>
            Réessayer
          </Button>
          <Button
            component={Link}
            href="/auth/signin"
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 1, minHeight: 46, px: 3, borderColor: "divider" }}
          >
            Se reconnecter
          </Button>
        </>
      }
      footnote={error.digest ? `Code à transmettre au support : ${error.digest}` : undefined}
    />
  );
}
