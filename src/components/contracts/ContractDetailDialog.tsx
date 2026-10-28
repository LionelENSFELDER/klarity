"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Dialog,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/EditOutlined";
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import {
  debitMonths,
  formatEuro,
  getUpcomingDebits,
  monthlyCost,
  relativeDay,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import { getFrequencyLabel } from "@/modules/contracts/categories";
import { DeleteContract, SetContractArchived } from "@/modules/contracts/actions";
import { findCategory, type Category } from "@/modules/categories/model";
import ContractAvatar from "./ContractAvatar";

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « janvier » pour un annuel, « en janvier, avril, juillet et octobre » pour un trimestriel. */
function inMonths(contract: CalendarContract): string {
  const names = debitMonths(contract.frequency, contract.anchorMonth).map((m) => MONTHS[m]);
  if (names.length === 1) return ` ${names[0]}`;
  if (names.length === 4) return ` en ${names.slice(0, 3).join(", ")} et ${names[3]}`;
  return "";
}

const PERIOD: Record<string, string> = {
  monthly: "/ mois",
  quarterly: "/ trimestre",
  annual: "/ an",
};

interface ContractDetailDialogProps {
  contract: CalendarContract | null;
  categories: Category[];
  today: Date;
  onClose: () => void;
  onEdit: (contract: CalendarContract) => void;
}

/**
 * Fiche d'un contrat, en lecture : ce qu'il coûte, quand il tombe, et les
 * actions. Modifier ouvre le formulaire ; archiver est mis en avant,
 * supprimer demande une confirmation.
 */
export default function ContractDetailDialog({
  contract,
  categories,
  today,
  onClose,
  onEdit,
}: ContractDetailDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  const close = () => {
    setConfirming(false);
    setError("");
    onClose();
  };

  const run = (fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const result = await fn();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      close();
      router.refresh();
    });
  };

  return (
    <Dialog
      open={contract !== null}
      onClose={close}
      maxWidth="xs"
      fullWidth
      aria-labelledby="contract-detail-title"
      slotProps={{ paper: { sx: { borderRadius: 1, p: { xs: 2.5, sm: 3.5 } } } }}
    >
      {contract && (
        <Detail
          contract={contract}
          category={findCategory(categories, contract.category)}
          today={today}
          pending={pending}
          confirming={confirming}
          error={error}
          onClose={close}
          onEdit={() => {
            close();
            onEdit(contract);
          }}
          onArchive={() => run(() => SetContractArchived(contract.id, true))}
          onAskDelete={() => setConfirming(true)}
          onCancelDelete={() => setConfirming(false)}
          onDelete={() => run(() => DeleteContract(contract.id))}
        />
      )}
    </Dialog>
  );
}

function Detail({
  contract,
  category,
  today,
  pending,
  confirming,
  error,
  onClose,
  onEdit,
  onArchive,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  contract: CalendarContract;
  category: Category;
  today: Date;
  pending: boolean;
  confirming: boolean;
  error: string;
  onClose: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const upcoming = getUpcomingDebits([contract], today, 24).slice(0, 3);
  const next = upcoming[0];
  const once = contract.frequency === "once";
  const provider = contract.provider !== contract.name ? contract.provider : null;

  const rows = [
    {
      k: "Fréquence",
      v: once
        ? `${getFrequencyLabel(contract.frequency)}${contract.startDate ? `, le ${DATE_FORMAT.format(new Date(contract.startDate))}` : ""}`
        : `${getFrequencyLabel(contract.frequency)}, le ${contract.debitDay === 1 ? "1er" : contract.debitDay}${inMonths(contract)}`,
    },
    contract.renewalDate && {
      k: "Renouvellement",
      v: DATE_FORMAT.format(new Date(contract.renewalDate)),
    },
    contract.contractNumber && { k: "Référence contrat", v: contract.contractNumber },
  ].filter((r): r is { k: string; v: string } => Boolean(r));

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <ContractAvatar contract={contract} category={category} size={56} />
        <IconButton aria-label="Fermer" onClick={onClose} sx={{ bgcolor: "action.hover" }}>
          <CloseIcon />
        </IconButton>
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" gap={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography id="contract-detail-title" component="h2" sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {contract.name}
          </Typography>
          {provider && <Typography sx={{ color: "text.secondary" }}>{provider}</Typography>}
        </Box>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            flex: "none",
            fontSize: 12,
            fontWeight: 600,
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            bgcolor: "action.hover",
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: category.color }} />
          {category.label}
        </Box>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        sx={{ borderRadius: 1, bgcolor: "background.default", px: 2.25, py: 2 }}
      >
        <Box>
          <Typography sx={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            {formatEuro(contract.amount)}
            {PERIOD[contract.frequency] && (
              <Box component="span" sx={{ fontSize: 15, fontWeight: 500, color: "text.secondary" }}>
                {" "}{PERIOD[contract.frequency]}
              </Box>
            )}
          </Typography>
          {(contract.frequency === "quarterly" || contract.frequency === "annual") && (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              ≈ {formatEuro(Math.round(monthlyCost(contract) * 100) / 100)} par mois lissé
            </Typography>
          )}
        </Box>
        {next && (
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>Prochain prélèvement</Typography>
            <Typography sx={{ fontWeight: 700 }}>{DATE_FORMAT.format(next.date)}</Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 600, color: "warning.dark" }}>
              {relativeDay(next.date, today).toLowerCase()}
            </Typography>
          </Box>
        )}
      </Stack>

      <Box component="dl" sx={{ m: 0 }}>
        {rows.map((r) => (
          <Stack
            key={r.k}
            direction="row"
            justifyContent="space-between"
            gap={1.5}
            sx={{ py: 1.25, borderBottom: 1, borderColor: "divider" }}
          >
            <Typography component="dt" sx={{ color: "text.secondary" }}>{r.k}</Typography>
            <Typography component="dd" sx={{ m: 0, fontWeight: 600, textAlign: "right" }}>{r.v}</Typography>
          </Stack>
        ))}
      </Box>

      {upcoming.length > 1 && (
        <Stack spacing={0.75}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary" }}>
            Prochains prélèvements
          </Typography>
          {upcoming.map((o) => (
            <Stack key={o.date.toISOString()} direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{DATE_FORMAT.format(o.date)}</Typography>
              <Typography sx={{ fontSize: 13 }}>{formatEuro(o.contract.amount)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {confirming ? (
        <Stack spacing={1.5} sx={{ border: 1, borderColor: "error.light", borderRadius: 1, p: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>
            Supprimer «&nbsp;{contract.name}&nbsp;» ?
          </Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            La suppression est définitive. Pour le retirer du calendrier sans
            le perdre, archive-le plutôt.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" color="error" disabled={pending} onClick={onDelete}>
              Supprimer définitivement
            </Button>
            <Button disabled={pending} onClick={onArchive}>
              Archiver à la place
            </Button>
            <Button color="inherit" onClick={onCancelDelete}>
              Annuler
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
            sx={{ flex: 1, minHeight: 46, borderRadius: 1 }}
          >
            Modifier
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArchiveIcon />}
            disabled={pending}
            onClick={onArchive}
            sx={{ flex: 1, minHeight: 46, borderRadius: 1, borderColor: "divider" }}
          >
            Archiver
          </Button>
          <IconButton
            aria-label="Supprimer définitivement"
            onClick={onAskDelete}
            sx={{ width: 46, height: 46, border: 1, borderColor: "error.light", color: "error.main" }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      )}
    </Stack>
  );
}
