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
  fontWeight: 400,
  fontSize: 21,
} as const;

const textSx = {
  color: "text.secondary",
  fontSize: 14,
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
  // Premier lancement : c'est le seul écran qui explique à quoi sert l'app.
  if (totalContracts === 0) {
    return (
      <Shell>
        <Typography sx={{ ...titleSx, fontSize: 28, letterSpacing: "-0.02em" }}>Bienvenue sur Klarity</Typography>
        <Typography sx={textSx}>
          Ajoute tes abonnements et contrats : Klarity te montre ce qui sera
          prélevé, et quand. Commence par celui que tu paies le plus souvent,
          un téléphone ou une box par exemple.
        </Typography>
        <Stack component="ol" spacing={0.75} sx={{ ...textSx, textAlign: "left", pl: 2.5, m: 0, pt: 0.5 }}>
          <li>Nom, montant et jour de prélèvement suffisent.</li>
          <li>Les échéances apparaissent ici et dans le calendrier.</li>
          <li>Les catégories se renomment dans Réglages.</li>
        </Stack>
        <Box sx={{ pt: 1.5 }}>
          <AddContractButton variant="contained">
            ＋ Ajouter mon premier contrat
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
