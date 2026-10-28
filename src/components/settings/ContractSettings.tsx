"use client";

import { ACTION_FAILED } from "@/lib/messages";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/EditOutlined";
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveIcon from "@mui/icons-material/UnarchiveOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
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
import { findCategory, NO_CATEGORY, type Category } from "@/modules/categories/model";
import { getFrequencyLabel } from "@/modules/contracts/categories";
import ContractFormDialog from "@/components/contracts/ContractFormDialog";
import ContractAvatar from "@/components/contracts/ContractAvatar";

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
      // Une action peut lever (session expirée, réseau) au lieu de renvoyer { error }.
      const result = await fn().catch(() => ({ error: ACTION_FAILED }));
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

      <Box sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 4.5, overflow: "hidden" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.25}
          alignItems={{ md: "center" }}
          sx={{ p: 2 }}
        >
          <TextField
            size="small"
            placeholder="Rechercher un contrat ou un fournisseur"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
              htmlInput: { "aria-label": "Rechercher un contrat ou un fournisseur" },
            }}
            sx={{ flex: 1, minWidth: 0 }}
          />
          <ToggleButtonGroup
            exclusive
            size="small"
            aria-label="Statut"
            value={status}
            onChange={(_, v) => v && setStatus(v)}
            sx={{
              bgcolor: "action.hover",
              p: 0.5,
              borderRadius: 2.5,
              "& .MuiToggleButton-root": {
                border: 0,
                borderRadius: "8px !important",
                px: 1.5,
                textTransform: "none",
                color: "text.primary",
              },
              "& .Mui-selected": {
                bgcolor: "background.paper !important",
                fontWeight: 600,
                boxShadow: 1,
              },
            }}
          >
            <ToggleButton value="actifs">Actifs · {contracts.length - archivedCount}</ToggleButton>
            <ToggleButton value="archives">Archivés · {archivedCount}</ToggleButton>
            <ToggleButton value="tous">Tous</ToggleButton>
          </ToggleButtonGroup>
          <TextField
            select
            size="small"
            label="Trier par"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            sx={{ minWidth: 170 }}
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
          sx={{ px: 2.5, py: 1.25, bgcolor: "background.default", borderTop: 1, borderColor: "divider" }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            {visible.length} contrat{visible.length > 1 ? "s" : ""} affiché
            {visible.length > 1 ? "s" : ""}
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
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
              const orphan = category.slug === NO_CATEGORY.slug;
              const archived = isArchived(contract);
              const next = archived ? null : getNextOccurrence(contract, today);

              return (
                <Box key={contract.id} sx={{ borderTop: 1, borderColor: "divider" }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.75}
                    sx={{
                      py: 1.5,
                      px: { xs: 1.5, sm: 2.5 },
                      opacity: archived ? 0.65 : 1,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <ContractAvatar contract={contract} category={category} size={36} />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <Typography
                          title={contract.name}
                          sx={{
                            fontSize: 14,
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {contract.name}
                        </Typography>
                        {archived && (
                          <Chip label="archivé" size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                        )}
                      </Stack>
                      <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
                        {contract.provider} · {category.label} ·{" "}
                        {getFrequencyLabel(contract.frequency)}
                        {next
                          ? ` · prochaine le ${next.getDate()} ${MONTHS[next.getMonth()]}`
                          : ""}
                      </Typography>
                    </Box>

                    <Box
                      component="span"
                      aria-hidden
                      sx={{
                        display: { xs: "none", md: "inline-flex" },
                        alignItems: "center",
                        gap: 0.75,
                        flex: "none",
                        fontSize: 12,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: orphan ? "warning.light" : "action.hover",
                        color: orphan ? "warning.contrastText" : "text.primary",
                      }}
                    >
                      <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: category.color }} />
                      {category.label}
                    </Box>

                    <Typography sx={{ fontSize: 14, fontWeight: 700, minWidth: 72, textAlign: "right", whiteSpace: "nowrap" }}>
                      {formatEuro(contract.amount)}
                    </Typography>

                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="Modifier">
                        <IconButton
                          size="small"
                          aria-label={`Modifier ${contract.name}`}
                          onClick={() => {
                            setEditing(contract);
                            setDeleting(null);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={archived ? "Restaurer" : "Archiver"}>
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`${archived ? "Restaurer" : "Archiver"} ${contract.name}`}
                            disabled={pending}
                            onClick={() =>
                              run(() => SetContractArchived(contract.id, !archived))
                            }
                          >
                            {archived ? <UnarchiveIcon fontSize="small" /> : <ArchiveIcon fontSize="small" />}
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          size="small"
                          aria-label={`Supprimer ${contract.name}`}
                          onClick={() => setDeleting(contract.id)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {deleting === contract.id && (
                    <Paper variant="outlined" sx={{ p: 2, mx: 2.5, mb: 1.5, borderRadius: 3 }}>
                      <Typography
                        sx={{
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

        <Box sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: "divider" }}>
          <Button variant="outlined" onClick={() => setCreating(true)} startIcon={<AddIcon />}>
            Nouveau contrat
          </Button>
        </Box>
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
        <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
          Aucun contrat
        </Typography>
        <Typography sx={{ color: "text.secondary", fontSize: 13, maxWidth: "44ch" }}>
          Ajoute un premier contrat pour le voir apparaître ici et dans tes
          échéances.
        </Typography>
        <Box sx={{ pt: 1 }}>
          <Button variant="outlined" onClick={onCreate}>
            Nouveau contrat
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack alignItems="center" spacing={1} sx={{ py: 6, textAlign: "center" }}>
      <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
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
