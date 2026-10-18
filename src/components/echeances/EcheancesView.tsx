"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  formatEuro,
  getUpcomingDebits,
  getMonthOccurrences,
  groupByMonth,
  monthlyCost,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import { findCategory, NO_CATEGORY, type Category } from "@/modules/categories/model";
import ContractFormDialog from "@/components/contracts/ContractFormDialog";
import DebitRow from "./DebitRow";
import EmptyState from "./EmptyState";
import MonthGrid from "./MonthGrid";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export const HORIZONS = [3, 6, 12] as const;

export interface EcheancesParams {
  liste: "a-venir" | "mois" | "tout";
  famille: string | null;
  fournisseur: string | null;
  vue: "liste" | "calendrier";
  horizon: number;
}

interface EcheancesViewProps {
  /** Contrats déjà filtrés côté serveur selon famille / fournisseur. */
  contracts: CalendarContract[];
  totalContracts: number;
  categories: Category[];
  params: EcheancesParams;
  /** Date du rendu, passée par le serveur pour rester stable à l'hydratation. */
  todayISO: string;
}

const LIST_LABELS: Record<EcheancesParams["liste"], string> = {
  "a-venir": "À venir",
  mois: "Ce mois-ci",
  tout: "Tout",
};

/** Conserve les filtres actifs en changeant un seul paramètre. */
function hrefWith(params: EcheancesParams, patch: Partial<EcheancesParams>) {
  const next = { ...params, ...patch };
  const q = new URLSearchParams();
  if (next.liste !== "a-venir") q.set("liste", next.liste);
  if (next.famille) q.set("famille", next.famille);
  if (next.fournisseur) q.set("fournisseur", next.fournisseur);
  if (next.vue !== "liste") q.set("vue", next.vue);
  if (next.horizon !== 3) q.set("horizon", String(next.horizon));
  const s = q.toString();
  return s ? `/calendar?${s}` : "/calendar";
}

export default function EcheancesView({
  contracts,
  totalContracts,
  categories,
  params,
  todayISO,
}: EcheancesViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CalendarContract | null>(null);
  const today = new Date(todayISO);

  const occurrences =
    params.liste === "mois"
      ? getMonthOccurrences(contracts, today.getFullYear(), today.getMonth())
      : getUpcomingDebits(contracts, today, params.horizon);

  const category = params.famille
    ? params.famille === NO_CATEGORY.slug
      ? NO_CATEGORY
      : findCategory(categories, params.famille)
    : null;

  const title = category
    ? category.label
    : params.fournisseur ?? LIST_LABELS[params.liste];

  const isPlainTout =
    params.liste === "tout" && !params.famille && !params.fournisseur;

  const detail = category
    ? `${contracts.length} contrat${contracts.length > 1 ? "s" : ""}`
    : params.fournisseur
      ? `${contracts.length} contrat${contracts.length > 1 ? "s" : ""}`
      : params.liste === "tout"
        ? `${contracts.length} contrats actifs`
        : params.liste === "mois"
          ? `${MONTHS[today.getMonth()]} ${today.getFullYear()}`
          : `${params.horizon} prochains mois`;

  const total = isPlainTout
    ? contracts.reduce((s, c) => s + monthlyCost(c), 0)
    : occurrences.reduce((s, o) => s + o.contract.amount, 0);

  const totalLabel = isPlainTout
    ? "par mois en moyenne"
    : params.liste === "mois"
      ? "ce mois-ci"
      : "sur la période";

  const showHorizon = params.vue === "liste" && params.liste === "a-venir";

  return (
    <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* En-tête : ce qu'on regarde, et combien ça pèse */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        flexWrap="wrap"
        gap={2}
        sx={{ px: { xs: 2, md: 3.5 }, pt: { xs: 2, md: 3 }, pb: 1.75 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
            {category && (
              <Box
                sx={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  bgcolor: category.color,
                  flex: "none",
                }}
              />
            )}
            <Typography
              component="h1"
              title={title}
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: { xs: 19, md: 23 },
                letterSpacing: "-0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </Typography>
          </Stack>
          <Typography sx={{ color: "text.secondary", fontSize: 12.5, mt: 0.4 }}>
            {isPlainTout
              ? detail
              : `${detail} · ${occurrences.length} échéance${occurrences.length > 1 ? "s" : ""}`}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Typography
            sx={{
              fontFamily: "var(--font-mono)",
              fontWeight: 500,
              fontSize: 21,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.02em",
            }}
          >
            {formatEuro(Math.round(total * 100) / 100)}
          </Typography>
          <Typography
            sx={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#5c6675",
              mt: "2px",
            }}
          >
            {totalLabel}
          </Typography>
        </Box>
      </Stack>

      {/* Barre d'outils : horizon à gauche, bascule de vue à droite */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1.5}
        sx={{
          px: { xs: 2, md: 3.5 },
          pb: 1.5,
          borderBottom: 1,
          borderColor: "#1e2029",
        }}
      >
        {showHorizon ? (
          <ToggleButtonGroup size="small" exclusive value={params.horizon}>
            {HORIZONS.map((h) => (
              <ToggleButton
                key={h}
                value={h}
                component={Link}
                href={hrefWith(params, { horizon: h })}
                sx={{ px: 1.5, py: 0.4, fontSize: 12.5, textTransform: "none" }}
              >
                {h} mois
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        ) : (
          <Typography sx={{ fontSize: 12, color: "#5c6675" }}>
            {params.vue === "calendrier"
              ? `${MONTHS[today.getMonth()]} ${today.getFullYear()}`
              : ""}
          </Typography>
        )}

        <ToggleButtonGroup size="small" exclusive value={params.vue}>
          <ToggleButton
            value="liste"
            component={Link}
            href={hrefWith(params, { vue: "liste" })}
            sx={{ px: 1.5, py: 0.4, fontSize: 12.5, textTransform: "none" }}
          >
            Liste
          </ToggleButton>
          <ToggleButton
            value="calendrier"
            component={Link}
            href={hrefWith(params, { vue: "calendrier" })}
            sx={{ px: 1.5, py: 0.4, fontSize: 12.5, textTransform: "none" }}
          >
            Calendrier
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Contenu */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: { xs: 2, md: 3.5 }, pb: 5 }}>
        {params.vue === "calendrier" ? (
          <MonthGrid
            contracts={contracts}
            categories={categories}
            year={today.getFullYear()}
            month={today.getMonth()}
            today={today}
            onSelect={setEditing}
          />
        ) : isPlainTout ? (
          contracts.length === 0 ? (
            <EmptyState
              scoped={contracts}
              totalContracts={totalContracts}
              filterLabel={null}
              horizon={params.horizon}
              today={today}
            />
          ) : (
            <>
              <MonthHeading label="Tous les contrats" right={String(contracts.length)} />
              {[...contracts]
                .sort((a, b) => b.amount - a.amount)
                .map((c) => (
                  <DebitRow
                    key={c.id}
                    occurrence={{
                      date: new Date(today.getFullYear(), today.getMonth(), c.debitDay),
                      contract: c,
                    }}
                    categories={categories}
                    today={today}
                    onEdit={setEditing}
                    hideDay={c.frequency === "once"}
                    markPast
                  />
                ))}
            </>
          )
        ) : occurrences.length === 0 ? (
          <EmptyState
            scoped={contracts}
            totalContracts={totalContracts}
            filterLabel={category?.label ?? params.fournisseur}
            horizon={params.horizon}
            today={today}
          />
        ) : (
          groupByMonth(occurrences).map((group) => (
            <Box key={`${group.year}-${group.month}`}>
              <MonthHeading
                label={`${MONTHS[group.month]} ${group.year}`}
                right={formatEuro(Math.round(group.total * 100) / 100)}
              />
              {group.items.map((o, i) => (
                <DebitRow
                  key={`${o.contract.id}-${i}`}
                  occurrence={o}
                  categories={categories}
                  today={today}
                  onEdit={setEditing}
                />
              ))}
            </Box>
          ))
        )}
      </Box>

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

function MonthHeading({ label, right }: { label: string; right: string }) {
  return (
    <Stack
      direction="row"
      alignItems="baseline"
      spacing={1.75}
      sx={{
        pt: 2.5,
        pb: 1,
        position: "sticky",
        top: 0,
        bgcolor: "background.default",
        zIndex: 1,
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
      <Typography
        sx={{
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          color: "text.secondary",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {right}
      </Typography>
    </Stack>
  );
}
