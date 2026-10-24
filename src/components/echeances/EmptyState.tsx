"use client";

import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  getNextOccurrence,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import AddContractButton from "@/components/contracts/AddContractButton";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const FREQUENCY_LABEL: Record<string, string> = {
  monthly: "mensuel",
  quarterly: "trimestriel",
  annual: "annuel",
  once: "ponctuel",
};

interface EmptyStateProps {
  /** Contrats après application du filtre courant. */
  scoped: CalendarContract[];
  totalContracts: number;
  filterLabel: string | null;
  horizon: number;
  today: Date;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 7, px: 1, textAlign: "center" }}>
      {children}
    </Stack>
  );
}

const titleSx = {
  fontWeight: 600,
  fontSize: 15,
} as const;

const textSx = {
  color: "text.secondary",
  fontSize: 13,
  maxWidth: "46ch",
  lineHeight: 1.55,
} as const;

/**
 * « Aucune échéance » et « aucun contrat » sont deux situations différentes :
 * un écran vide sans explication se lit comme une panne.
 */
export default function EmptyState({
  scoped,
  totalContracts,
  filterLabel,
  horizon,
  today,
}: EmptyStateProps) {
  if (totalContracts === 0) {
    return (
      <Shell>
        <Typography sx={titleSx}>Aucun contrat</Typography>
        <Typography sx={textSx}>
          Ajoute un premier contrat pour voir ses prélèvements apparaître ici.
        </Typography>
        <Box sx={{ pt: 1 }}>
          <AddContractButton variant="outlined" size="small">
            ＋ Nouveau contrat
          </AddContractButton>
        </Box>
      </Shell>
    );
  }

  if (scoped.length === 0) {
    return (
      <Shell>
        <Typography sx={titleSx}>
          Aucun contrat dans «&nbsp;{filterLabel ?? "ce filtre"}&nbsp;»
        </Typography>
        <Typography sx={textSx}>
          Ce filtre ne contient aucun contrat pour le moment.
        </Typography>
        <Box sx={{ pt: 1 }}>
          <Button component={Link} href="/calendar" variant="outlined" size="small">
            Voir toutes les échéances
          </Button>
        </Box>
      </Shell>
    );
  }

  // Des contrats existent ici, mais aucune occurrence sur l'horizon demandé :
  // on dit quand tombe la prochaine plutôt que d'afficher le vide.
  const nexts = scoped
    .map((contract) => ({ contract, date: getNextOccurrence(contract, today) }))
    .filter((x): x is { contract: CalendarContract; date: Date } => x.date !== null)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  if (nexts.length > 0) {
    const { contract, date } = nexts[0];
    return (
      <Shell>
        <Typography sx={titleSx}>
          Rien sur les {horizon} prochains mois
        </Typography>
        <Typography sx={textSx}>
          {scoped.length} contrat{scoped.length > 1 ? "s" : ""} ici, mais la
          prochaine échéance ({contract.name},{" "}
          {FREQUENCY_LABEL[contract.frequency] ?? contract.frequency}) tombe en{" "}
          {MONTHS[date.getMonth()]} {date.getFullYear()}.
        </Typography>
        <Box sx={{ pt: 1 }}>
          <Button
            component={Link}
            href="/calendar?liste=a-venir&horizon=12"
            variant="outlined"
            size="small"
          >
            Élargir à 12 mois
          </Button>
        </Box>
      </Shell>
    );
  }

  return (
    <Shell>
      <Typography sx={titleSx}>Plus aucune échéance à venir</Typography>
      <Typography sx={textSx}>
        Les contrats de ce filtre sont des prélèvements uniques déjà passés.
      </Typography>
      <Box sx={{ pt: 1 }}>
        <Button component={Link} href="/calendar" variant="outlined" size="small">
          Voir toutes les échéances
        </Button>
      </Box>
    </Shell>
  );
}
