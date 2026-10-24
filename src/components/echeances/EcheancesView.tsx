"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import AddIcon from "@mui/icons-material/Add";
import {
  formatEuro,
  getUpcomingDebits,
  getMonthOccurrences,
  groupByDay,
  groupByMonth,
  monthlyCost,
  relativeDay,
  type CalendarContract,
  type Occurrence,
} from "@/modules/contracts/calendar";
import type { CategoryLoad, Renewal } from "@/modules/contracts/dashboard";
import { findCategory, NO_CATEGORY, type Category } from "@/modules/categories/model";
import { HORIZONS, hrefWith, type EcheancesParams } from "./params";
import ContractFormDialog from "@/components/contracts/ContractFormDialog";
import AddContractButton from "@/components/contracts/AddContractButton";
import ContractAvatar from "@/components/contracts/ContractAvatar";
import DebitRow from "./DebitRow";
import EmptyState from "./EmptyState";
import MonthGrid from "./MonthGrid";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** Vue d'ensemble du portefeuille, calculée par la page serveur. */
export interface EcheancesSummary {
  remainingThisMonth: number;
  remainingCount: number;
  nextMonthTotal: number;
  smoothedMonthly: number;
  contractCount: number;
  /** Renouvellements dans les 90 prochains jours. */
  renewalsSoon: number;
  next: Occurrence | null;
  renewals: Renewal[];
  categories: CategoryLoad[];
}

interface EcheancesViewProps {
  /** Contrats déjà filtrés côté serveur selon catégorie / fournisseur. */
  contracts: CalendarContract[];
  totalContracts: number;
  categories: Category[];
  params: EcheancesParams;
  summary: EcheancesSummary;
  /** Date du rendu, passée par le serveur pour rester stable à l'hydratation. */
  todayISO: string;
}

const LIST_LABELS: Record<EcheancesParams["liste"], string> = {
  "a-venir": "À venir",
  mois: "Ce mois-ci",
  tout: "Tout",
};

const DAY_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const euro = (n: number) => formatEuro(Math.round(n * 100) / 100);

const cardSx = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: 4.5,
} as const;

export default function EcheancesView({
  contracts,
  totalContracts,
  categories,
  params,
  summary,
  todayISO,
}: EcheancesViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState<CalendarContract | null>(null);
  const today = new Date(todayISO);

  const occurrences =
    params.liste === "mois"
      ? getMonthOccurrences(contracts, today.getFullYear(), today.getMonth())
      : getUpcomingDebits(contracts, today, params.horizon);

  const category = params.categorie
    ? params.categorie === NO_CATEGORY.slug
      ? NO_CATEGORY
      : findCategory(categories, params.categorie)
    : null;

  const title = category
    ? category.label
    : params.fournisseur ?? LIST_LABELS[params.liste];

  const isPlainTout =
    params.liste === "tout" && !params.categorie && !params.fournisseur;

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
  const nextMonth = MONTHS[(today.getMonth() + 1) % 12];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const kpis = [
    {
      label: "Reste à prélever ce mois-ci",
      value: euro(summary.remainingThisMonth),
      note: `${summary.remainingCount} prélèvement${summary.remainingCount > 1 ? "s" : ""} d'ici le ${lastDay}`,
    },
    {
      label: `Prévu en ${nextMonth}`,
      value: euro(summary.nextMonthTotal),
      note: "Tous contrats confondus",
    },
    {
      label: "Coût mensuel lissé",
      value: euro(summary.smoothedMonthly),
      note: "Trimestriels et annuels ramenés au mois",
    },
    {
      label: "Contrats actifs",
      value: String(summary.contractCount),
      note:
        summary.renewalsSoon > 0
          ? `${summary.renewalsSoon} renouvellement${summary.renewalsSoon > 1 ? "s" : ""} sous 90 jours`
          : "Aucun renouvellement proche",
    },
  ];

  return (
    <Box sx={{ minWidth: 0, flex: 1, minHeight: 0, overflowY: "auto" }}>
      <Stack spacing={3} sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3.5 }, pb: 5 }}>
        {/* En-tête : ce qu'on regarde, combien ça pèse, et les actions */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          flexWrap="wrap"
          gap={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              {isPlainTout
                ? detail
                : `${detail} · ${occurrences.length} échéance${occurrences.length > 1 ? "s" : ""}`}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, mt: 0.5 }}>
              {category && (
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 1,
                    bgcolor: category.color,
                    flex: "none",
                  }}
                />
              )}
              <Typography
                component="h1"
                title={title}
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 22, md: 28 },
                  letterSpacing: "-0.02em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </Typography>
            </Stack>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap" useFlexGap>
            <Box sx={{ textAlign: "right", mr: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em" }}>
                {euro(total)}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                {totalLabel}
              </Typography>
            </Box>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={params.vue}
              aria-label="Affichage"
              sx={{
                bgcolor: "action.hover",
                p: 0.5,
                borderRadius: 3,
                "& .MuiToggleButton-root": {
                  border: 0,
                  borderRadius: "9px !important",
                  px: 1.75,
                  gap: 0.75,
                  textTransform: "none",
                  fontWeight: 500,
                  color: "text.primary",
                },
                "& .Mui-selected": {
                  bgcolor: "background.paper !important",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
                },
              }}
            >
              <ToggleButton value="liste" component={Link} href={hrefWith(params, { vue: "liste" })}>
                <ViewListIcon sx={{ fontSize: 17 }} />
                Liste
              </ToggleButton>
              <ToggleButton
                value="calendrier"
                component={Link}
                href={hrefWith(params, { vue: "calendrier" })}
              >
                <CalendarMonthIcon sx={{ fontSize: 17 }} />
                Calendrier
              </ToggleButton>
            </ToggleButtonGroup>
            {/* Emplacement réservé : aucune notification n'est encore envoyée. */}
            <Tooltip title="Notifications : bientôt">
              <span>
                <IconButton
                  disabled
                  aria-label="Notifications (bientôt disponibles)"
                  sx={{ border: 1, borderColor: "divider", borderRadius: 3, width: 44, height: 44 }}
                >
                  <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
            <AddContractButton
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minHeight: 44, borderRadius: 3, px: 2 }}
            >
              Ajouter
            </AddContractButton>
          </Stack>
        </Stack>

        {/* Indicateurs : tout le portefeuille, quel que soit le filtre */}
        <Box
          component="section"
          aria-label="Résumé"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: 2,
          }}
        >
          {kpis.map((k) => (
            <Stack key={k.label} spacing={1.25} sx={{ ...cardSx, borderRadius: 4, px: 2.5, py: 2.25 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary" }}>
                {k.label}
              </Typography>
              <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {k.value}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{k.note}</Typography>
            </Stack>
          ))}
        </Box>

        {params.vue === "calendrier" ? (
          <MonthGrid
            contracts={contracts}
            categories={categories}
            year={today.getFullYear()}
            month={today.getMonth()}
            today={today}
            onSelect={setEditing}
          />
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={3} alignItems="flex-start">
            <Box component="section" aria-label="Échéances" sx={{ flex: "999 1 560px", minWidth: 0, ...cardSx, overflow: "hidden" }}>
              {showHorizon && (
                <Stack direction="row" spacing={0.75} sx={{ px: { xs: 1.5, sm: 2.5 }, py: 2 }}>
                  {HORIZONS.map((h) => {
                    const selected = params.horizon === h;
                    return (
                      <Box
                        key={h}
                        component={Link}
                        href={hrefWith(params, { horizon: h })}
                        aria-current={selected ? "true" : undefined}
                        sx={{
                          px: 1.75,
                          py: 0.75,
                          borderRadius: 999,
                          border: 1,
                          fontSize: 13,
                          textDecoration: "none",
                          borderColor: selected ? "primary.main" : "divider",
                          bgcolor: selected
                            ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)"
                            : "transparent",
                          color: selected ? "primary.dark" : "text.primary",
                          fontWeight: selected ? 600 : 400,
                          ".dark &": selected ? { color: "primary.light" } : {},
                        }}
                      >
                        {h} mois
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {isPlainTout ? (
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
                      right={euro(group.total)}
                    />
                    {groupByDay(group.items).map((day) => (
                      <Box key={day.date.toDateString()}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            px: { xs: 1.5, sm: 2.5 },
                            py: 1.25,
                            borderTop: 1,
                            borderColor: "divider",
                            bgcolor: "background.default",
                          }}
                        >
                          <Stack direction="row" spacing={1.25} alignItems="baseline">
                            <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                              {cap(DAY_FORMAT.format(day.date))}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                              {relativeDay(day.date, today)}
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "text.secondary" }}>
                            {euro(day.total)}
                          </Typography>
                        </Stack>
                        {day.items.map((o, i) => (
                          <DebitRow
                            key={`${o.contract.id}-${i}`}
                            occurrence={o}
                            categories={categories}
                            today={today}
                            onEdit={setEditing}
                          />
                        ))}
                      </Box>
                    ))}
                  </Box>
                ))
              )}
            </Box>

            <SidePanel
              summary={summary}
              categories={categories}
              today={today}
              onOpen={setEditing}
            />
          </Stack>
        )}
      </Stack>

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
      alignItems="center"
      justifyContent="space-between"
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        py: 1.25,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: 12,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{right}</Typography>
    </Stack>
  );
}

/** Colonne de droite : prochain prélèvement, renouvellements, catégories. */
function SidePanel({
  summary,
  categories,
  today,
  onOpen,
}: {
  summary: EcheancesSummary;
  categories: Category[];
  today: Date;
  onOpen: (contract: CalendarContract) => void;
}) {
  const { next, renewals } = summary;
  const loads = summary.categories.slice(0, 6);
  const loadTotal = loads.reduce((s, c) => s + c.monthlyCost, 0);

  return (
    <Stack component="aside" spacing={2} sx={{ flex: "1 1 300px", minWidth: 0 }}>
      {next && (
        <Stack
          spacing={1.75}
          sx={{ borderRadius: 4.5, p: 2.5, bgcolor: "#111827", color: "#fff" }}
        >
          <Typography sx={{ fontSize: 13, color: "#c7cbd4" }}>Prochain prélèvement</Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ContractAvatar
              contract={next.contract}
              category={findCategory(categories, next.contract.category)}
              size={44}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 16 }} noWrap>
                {next.contract.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#c7cbd4" }}>
                {cap(DAY_FORMAT.format(new Date(next.date)))} · {relativeDay(new Date(next.date), today).toLowerCase()}
              </Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em" }}>
            {formatEuro(next.contract.amount)}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={() => onOpen(next.contract)}
            sx={{
              height: 40,
              border: 0,
              borderRadius: 2.5,
              bgcolor: "#fff",
              color: "#111827",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Voir le contrat
          </Box>
        </Stack>
      )}

      {renewals.length > 0 && (
        <Stack spacing={1.75} sx={{ ...cardSx, p: 2.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600 }}>
              Renouvellements à surveiller
            </Typography>
            <AutorenewIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Stack>
          {renewals.map((r) => {
            const date = new Date(r.date);
            return (
              <Stack key={r.contract.id} direction="row" spacing={1.5} alignItems="center">
                <Stack
                  sx={{
                    width: 46,
                    flex: "none",
                    alignItems: "center",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2.5,
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: "text.secondary", textTransform: "uppercase" }}>
                    {MONTHS[date.getMonth()].slice(0, 4)}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
                    {date.getDate()}
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }} noWrap>
                    {r.contract.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
                    {r.contract.provider} · {relativeDay(date, today).toLowerCase()}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 600 }}>{formatEuro(r.contract.amount)}</Typography>
              </Stack>
            );
          })}
        </Stack>
      )}

      {loadTotal > 0 && (
        <Stack spacing={1.75} sx={{ ...cardSx, p: 2.5 }}>
          <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600 }}>
            Coût mensuel par catégorie
          </Typography>
          <Stack direction="row" spacing="2px" sx={{ height: 10, borderRadius: 999, overflow: "hidden" }} aria-hidden>
            {loads.map((c) => (
              <Box key={c.slug} sx={{ width: `${(c.monthlyCost / loadTotal) * 100}%`, bgcolor: c.color }} />
            ))}
          </Stack>
          {loads.map((c) => (
            <Stack key={c.slug} direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: c.color, flex: "none" }} />
              <Typography sx={{ flex: 1, fontSize: 13, color: "text.secondary" }} noWrap>
                {c.label}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{euro(c.monthlyCost)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
