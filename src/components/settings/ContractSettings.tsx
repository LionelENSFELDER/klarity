"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  DeleteContract,
  SetContractArchived,
} from "@/modules/contracts/actions";
import type { ManagedContract } from "@/modules/contracts/queries";
import {
  formatEuro,
  getNextOccurrence,
  monthlyCost,
} from "@/modules/contracts/calendar";
import { findCategory, type Category } from "@/modules/categories/model";
import { getFrequencyLabel } from "@/modules/contracts/categories";
import ContractFormDialog from "@/components/contracts/ContractFormDialog";

const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

type StatusFilter = "actifs" | "archives" | "tous";
type SortKey = "montant" | "nom" | "echeance";

interface ContractSettingsProps {
  contracts: ManagedContract[];
  categories: Category[];
}

const isArchived = (c: ManagedContract) => c.status !== "active";

export default function ContractSettings({
  contracts,
  categories,
}: ContractSettingsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("actifs");
  const [sort, setSort] = useState<SortKey>("montant");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<ManagedContract | null>(null);
  const [creating, setCreating] = useState(false);

  const today = useMemo(() => new Date(), []);

  const run = (fn: () => Promise<{ success: true } | { error: string }>) => {
    startTransition(async () => {
      const result = await fn();
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setError("");
      setDeleting(null);
      router.refresh();
    });
  };

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = contracts.filter((c) => {
      if (status === "actifs" && isArchived(c)) return false;
      if (status === "archives" && !isArchived(c)) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.provider.toLowerCase().includes(needle)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "nom") return a.name.localeCompare(b.name, "fr");
      if (sort === "echeance") {
        // Un contrat archivé n'a plus d'échéance : il passe en fin de liste.
        const da = isArchived(a) ? null : getNextOccurrence(a, today);
        const db = isArchived(b) ? null : getNextOccurrence(b, today);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
      }
      return b.amount - a.amount;
    });
  }, [contracts, search, status, sort, today]);

  const archivedCount = contracts.filter(isArchived).length;
  const activeMonthly = contracts
    .filter((c) => !isArchived(c))
    .reduce((s, c) => s + monthlyCost(c), 0);

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        sx={{ mb: 2 }}
        alignItems={{ sm: "center" }}
      >
        <TextField
          size="small"
          placeholder="Rechercher un contrat ou un fournisseur"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <TextField
          select
          size="small"
          label="Statut"
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="actifs">Actifs</MenuItem>
          <MenuItem value="archives">
            Archivés{archivedCount ? ` (${archivedCount})` : ""}
          </MenuItem>
          <MenuItem value="tous">Tous</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Trier par"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="montant">Montant</MenuItem>
          <MenuItem value="nom">Nom</MenuItem>
          <MenuItem value="echeance">Prochaine échéance</MenuItem>
        </TextField>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        sx={{ pb: 1, mb: 0.5, borderBottom: 1, borderColor: "#1e2029" }}
      >
        <Typography sx={{ fontSize: 12, color: "#5c6675" }}>
          {visible.length} contrat{visible.length > 1 ? "s" : ""} affiché
          {visible.length > 1 ? "s" : ""}
        </Typography>
        <Typography
          sx={{
            fontFamily: "var(--font-mono)",
            fontSize: 12.5,
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatEuro(Math.round(activeMonthly))}/mois en actifs
        </Typography>
      </Stack>

      {visible.length === 0 ? (
        <EmptyList
          hasContracts={contracts.length > 0}
          filtered={Boolean(search.trim()) || status !== "actifs"}
          onCreate={() => setCreating(true)}
        />
      ) : (
        <Stack>
          {visible.map((contract) => {
            const category = findCategory(categories, contract.category);
            const archived = isArchived(contract);
            const next = archived ? null : getNextOccurrence(contract, today);

            return (
              <Box key={contract.id}>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    py: 1.25,
                    px: 1,
                    borderRadius: 1.5,
                    opacity: archived ? 0.6 : 1,
                    "& + &": { boxShadow: "0 -1px 0 #1e2029" },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      bgcolor: category.color,
                      flex: "none",
                    }}
                  />

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Typography
                        title={contract.name}
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {contract.name}
                      </Typography>
                      {archived && (
                        <Chip
                          label="archivé"
                          size="small"
                          variant="outlined"
                          sx={{
                            height: 17,
                            fontSize: 10,
                            borderColor: "#5c6675",
                            color: "#5c6675",
                            "& .MuiChip-label": { px: 0.75 },
                          }}
                        />
                      )}
                    </Stack>
                    <Typography sx={{ fontSize: 11.5, color: "#5c6675", mt: "1px" }}>
                      {contract.provider} · {category.label} ·{" "}
                      {getFrequencyLabel(contract.frequency)}
                      {next
                        ? ` · prochaine le ${next.getDate()} ${MONTHS[next.getMonth()]}`
                        : ""}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatEuro(contract.amount)}
                  </Typography>

                  <Stack direction="row" spacing={0.5}>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        setEditing(contract);
                        setDeleting(null);
                      }}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      disabled={pending}
                      onClick={() =>
                        run(() => SetContractArchived(contract.id, !archived))
                      }
                    >
                      {archived ? "Restaurer" : "Archiver"}
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setDeleting(contract.id)}
                    >
                      Supprimer
                    </Button>
                  </Stack>
                </Stack>

                {deleting === contract.id && (
                  <Paper variant="outlined" sx={{ p: 2, my: 1 }}>
                    <Typography
                      sx={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: 13.5,
                        mb: 0.75,
                      }}
                    >
                      Supprimer «&nbsp;{contract.name}&nbsp;» ?
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12.5, color: "text.secondary", mb: 1.5 }}
                    >
                      La suppression est définitive : le contrat et son
                      historique d&apos;échéances disparaissent.{" "}
                      {!archived &&
                        "Pour le retirer du calendrier sans le perdre, archive-le plutôt."}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={pending}
                        onClick={() => run(() => DeleteContract(contract.id))}
                      >
                        Supprimer définitivement
                      </Button>
                      {!archived && (
                        <Button
                          disabled={pending}
                          onClick={() =>
                            run(() => SetContractArchived(contract.id, true))
                          }
                        >
                          Archiver à la place
                        </Button>
                      )}
                      <Button color="inherit" onClick={() => setDeleting(null)}>
                        Annuler
                      </Button>
                    </Stack>
                  </Paper>
                )}
              </Box>
            );
          })}
        </Stack>
      )}

      <Box sx={{ mt: 2.25, pt: 1.75, borderTop: 1, borderColor: "#1e2029" }}>
        <Button variant="outlined" size="small" onClick={() => setCreating(true)}>
          ＋ Nouveau contrat
        </Button>
      </Box>

      {archivedCount > 0 && status === "actifs" && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {archivedCount} contrat{archivedCount > 1 ? "s" : ""} archivé
          {archivedCount > 1 ? "s" : ""} — masqué
          {archivedCount > 1 ? "s" : ""} du calendrier et des échéances.
          Change le filtre de statut pour {archivedCount > 1 ? "les" : "le"}{" "}
          retrouver.
        </Alert>
      )}

      <ContractFormDialog
        open={creating}
        mode="create"
        onClose={() => {
          setCreating(false);
          router.refresh();
        }}
      />
      <ContractFormDialog
        open={editing !== null}
        mode="edit"
        contract={editing}
        onClose={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </Box>
  );
}

function EmptyList({
  hasContracts,
  filtered,
  onCreate,
}: {
  hasContracts: boolean;
  filtered: boolean;
  onCreate: () => void;
}) {
  // « Aucun contrat » et « aucun résultat » sont deux situations différentes.
  if (!hasContracts) {
    return (
      <Stack alignItems="center" spacing={1} sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
          Aucun contrat
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 13, maxWidth: "44ch" }}>
          Ajoute un premier contrat pour le voir apparaître ici et dans tes
          échéances.
        </Typography>
        <Box sx={{ pt: 1 }}>
          <Button variant="outlined" size="small" onClick={onCreate}>
            ＋ Nouveau contrat
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 6, textAlign: "center" }}>
      <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
        Aucun résultat
      </Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13, maxWidth: "44ch" }}>
        {filtered
          ? "Aucun contrat ne correspond à cette recherche ou à ce filtre."
          : "Aucun contrat à afficher."}
      </Typography>
    </Stack>
  );
}
