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
import ContractDetailDialog from "@/components/contracts/ContractDetailDialog";
import AddContractButton from "@/components/contracts/AddContractButton";
import ContractAvatar from "@/components/contracts/ContractAvatar";
import StatCard, { statGridSx } from "@/components/ui/StatCard";
import { cardSx, insetSx, scrollBoxSx } from "@/components/ui/surface";
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

export default function EcheancesView({
  contracts,
  totalContracts,
  categories,
  params,
  summary,
  todayISO,
}: EcheancesViewProps) {
  const router = useRouter();
  const [viewing, setViewing] = useState<CalendarContract | null>(null);
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
    // À partir de md l'écran tient dans la fenêtre : la page ne défile pas,
    // chaque boîte (liste, cartes latérales) défile seule. Sur mobile, la
    // page défile normalement : des défilements imbriqués gênent au doigt.
    <Box
      sx={{
        minWidth: 0,
        flex: 1,
        minHeight: 0,
        // Filet : sur un écran trop bas, la page redéfile plutôt que d'écraser la liste.
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack
        spacing={{ xs: 2, md: 2.5 }}
        sx={{
          px: { xs: 2, md: 3 },
          pt: { xs: 1, md: 3 },
          pb: { xs: 5, md: 3 },
          flex: { md: 1 },
          minHeight: 0,
          "& > *": { flexShrink: 0 },
        }}
      >
        {/* En-tête : ce qu'on regarde, combien ça pèse, et les actions */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
          flexWrap="wrap"
          gap={2}
        >
          <Box sx={{ minWidth: 0 }}>
            {/* Fil d'Ariane : où l'on est et quand. */}
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
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
                  fontWeight: 400,
                  fontSize: { xs: 28, md: 32 },
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
              <Typography sx={{ fontWeight: 400, fontSize: 24, letterSpacing: "-0.02em" }}>
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
              sx={{ height: 48, bgcolor: "rgba(0 0 0 / 0.05)", ".dark &": { bgcolor: "action.hover" } }}
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
                  sx={{ bgcolor: "background.paper", width: 48, height: 48 }}
                >
                  <NotificationsNoneIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </span>
            </Tooltip>
            <AddContractButton
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ minHeight: 48, px: 2.5, fontSize: 15 }}
            >
              Nouveau contrat
            </AddContractButton>
          </Stack>
        </Stack>

        {/* Indicateurs : tout le portefeuille, quel que soit le filtre.
            Masqués sans contrat : quatre « 0 € » repoussaient l'accueil sous la ligne de flottaison. */}
        {totalContracts > 0 && (
          <Box component="section" aria-label="Résumé" sx={statGridSx}>
            {kpis.map((k) => (
              <StatCard key={k.label} {...k} />
            ))}
          </Box>
        )}

        {params.vue === "calendrier" ? (
          <MonthGrid
            contracts={contracts}
            categories={categories}
            year={today.getFullYear()}
            month={today.getMonth()}
            today={today}
            onSelect={setViewing}
          />
        ) : (
          <Stack
            direction="row"
            flexWrap={{ xs: "wrap", md: "nowrap" }}
            gap={2.5}
            alignItems={{ xs: "flex-start", md: "stretch" }}
            sx={{ flex: { md: "1 1 0" }, minHeight: { md: 420 } }}
          >
            <Box
              component="section"
              aria-label="Échéances"
              sx={{
                flex: "999 1 560px",
                minWidth: 0,
                minHeight: 0,
                ...cardSx,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {showHorizon && (
                <Stack
                  direction="row"
                  spacing={0.25}
                  sx={{ flex: "none", mx: { xs: 1.5, sm: 2.5 }, mt: 2.5, mb: 1, p: 0.5, borderRadius: 999, bgcolor: "action.hover", width: "fit-content" }}
                >
                  {HORIZONS.map((h) => {
                    const selected = params.horizon === h;
                    return (
                      <Box
                        key={h}
                        component={Link}
                        href={hrefWith(params, { horizon: h })}
                        aria-current={selected ? "true" : undefined}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 999,
                          fontSize: 14,
                          fontWeight: 500,
                          textDecoration: "none",
                          bgcolor: selected ? "background.paper" : "transparent",
                          boxShadow: selected ? "0 1px 2px rgba(20,22,18,0.08)" : "none",
                          color: selected ? "text.primary" : "text.secondary",
                        }}
                      >
                        {h} mois
                      </Box>
                    );
                  })}
                </Stack>
              )}

              {/* Les lignes défilent ; le choix de période et le pied restent en place. */}
              <Box
                tabIndex={0}
                aria-label="Liste des échéances"
                sx={{ ...scrollBoxSx, flex: 1, pb: 1 }}
              >
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
                          onOpen={setViewing}
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
                          }}
                        >
                          {/* En-tête de groupe : point, jour, quand. */}
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "success.main" }} />
                            <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                              {cap(DAY_FORMAT.format(day.date))}
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                              {relativeDay(day.date, today)}
                            </Typography>
                          </Stack>
                          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                            {euro(day.total)}
                          </Typography>
                        </Stack>
                        {day.items.map((o, i) => (
                          <DebitRow
                            key={`${o.contract.id}-${i}`}
                            occurrence={o}
                            categories={categories}
                            today={today}
                            onOpen={setViewing}
                          />
                        ))}
                      </Box>
                    ))}
                  </Box>
                ))
              )}
              </Box>

              {(isPlainTout ? contracts.length : occurrences.length) > 0 && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{ flex: "none", px: { xs: 1.5, sm: 2.5 }, py: 1.5, borderTop: 1, borderColor: "divider", fontSize: 14 }}
                >
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    {isPlainTout
                      ? `${contracts.length} contrat${contracts.length > 1 ? "s" : ""}`
                      : `${occurrences.length} échéance${occurrences.length > 1 ? "s" : ""}`}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {euro(total)} {totalLabel}
                  </Typography>
                </Stack>
              )}
            </Box>

            <SidePanel
              summary={summary}
              categories={categories}
              today={today}
              onOpen={setViewing}
            />
          </Stack>
        )}
      </Stack>

      <ContractDetailDialog
        contract={viewing}
        categories={categories}
        today={today}
        onClose={() => setViewing(null)}
        onEdit={setEditing}
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

/** Carte latérale : se partage la hauteur restante et défile seule. */
const sideScrollSx = {
  ...scrollBoxSx,
  flex: { md: "1 1 0" },
  minHeight: { md: 140 },
  "& > *": { flexShrink: 0 },
} as const;

function MonthHeading({ label, right }: { label: string; right: string }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        px: { xs: 1.5, sm: 2.5 },
        pt: 2.5,
        pb: 1.5,
        // Reste visible pendant le défilement de la liste.
        position: "sticky",
        top: 0,
        zIndex: 1,
        bgcolor: "background.paper",
      }}
    >
      <Typography component="h2" sx={{ fontSize: 21, fontWeight: 400 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 15, color: "text.secondary" }}>{right}</Typography>
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
    <Stack
      component="aside"
      spacing={2}
      sx={{ flex: { xs: "1 1 300px", md: "0 0 340px" }, minWidth: 0, minHeight: 0 }}
    >
      {next && (
        <Stack spacing={2} sx={{ ...cardSx, p: 3, flex: "none" }}>
          <Typography component="h2" sx={{ fontSize: 21, fontWeight: 400 }}>
            Prochain prélèvement
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ContractAvatar
              contract={next.contract}
              category={findCategory(categories, next.contract.category)}
              size={44}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 500, fontSize: 16 }} noWrap>
                {next.contract.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                {cap(DAY_FORMAT.format(new Date(next.date)))} · {relativeDay(new Date(next.date), today).toLowerCase()}
              </Typography>
            </Box>
          </Stack>
          <Typography sx={{ fontSize: 56, fontWeight: 400, letterSpacing: "-0.04em", lineHeight: 1 }}>
            {formatEuro(next.contract.amount)}
          </Typography>
          <Box
            component="button"
            type="button"
            onClick={() => onOpen(next.contract)}
            sx={{
              height: 44,
              border: 0,
              borderRadius: 999,
              bgcolor: "action.hover",
              color: "text.primary",
              font: "inherit",
              fontWeight: 500,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.selected" },
            }}
          >
            Voir le contrat
          </Box>
        </Stack>
      )}

      {renewals.length > 0 && (
        <Stack spacing={1.25} sx={{ ...cardSx, ...sideScrollSx, p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 0.5 }}>
            <Typography component="h2" sx={{ fontSize: 21, fontWeight: 400 }}>
              Renouvellements à surveiller
            </Typography>
            <AutorenewIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Stack>
          {renewals.map((r) => {
            const date = new Date(r.date);
            return (
              <Stack key={r.contract.id} direction="row" spacing={1.5} alignItems="center" sx={{ ...insetSx, p: 1.5 }}>
                <Stack
                  sx={{
                    width: 48,
                    flex: "none",
                    alignItems: "center",
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: 18, lineHeight: 1.2 }}>
                    {date.getDate()}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    {MONTHS[date.getMonth()].slice(0, 4)}
                  </Typography>
                </Stack>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 500 }} noWrap>
                    {r.contract.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
                    {r.contract.provider} · {relativeDay(date, today).toLowerCase()}
                  </Typography>
                </Box>
                <Typography sx={{ fontWeight: 500 }}>{formatEuro(r.contract.amount)}</Typography>
              </Stack>
            );
          })}
        </Stack>
      )}

      {loadTotal > 0 && (
        <Stack spacing={1.75} sx={{ ...cardSx, ...sideScrollSx, p: 3 }}>
          <Typography component="h2" sx={{ fontSize: 21, fontWeight: 400 }}>
            Coût mensuel par catégorie
          </Typography>
          <Stack direction="row" spacing="2px" sx={{ height: 22, borderRadius: 999, overflow: "hidden" }} aria-hidden>
            {loads.map((c) => (
              <Box key={c.slug} sx={{ width: `${(c.monthlyCost / loadTotal) * 100}%`, bgcolor: c.color }} />
            ))}
          </Stack>
          {loads.map((c) => (
            <Stack key={c.slug} direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: c.color, flex: "none" }} />
              <Typography sx={{ flex: 1, fontSize: 14 }} noWrap>
                {c.label}
              </Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{euro(c.monthlyCost)}</Typography>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
