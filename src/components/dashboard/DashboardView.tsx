// "use client";

import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import {
  formatEuro,
  relativeDay,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import { getFrequencyLabel } from "@/modules/contracts/categories";
import { findCategory, type Category } from "@/modules/categories/model";
import type {
  CategoryLoad,
  CategoryProviderFlow,
  DayLoad,
  ProjectionMonth,
  Renewal,
} from "@/modules/contracts/dashboard";
import ContractAvatar from "@/components/contracts/ContractAvatar";
import StatCard, { statGridSx } from "@/components/ui/StatCard";
import SankeyChart from "./SankeyChart";

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];
const MONTHS_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

export interface DashboardData {
  contractCount: number;
  providerCount: number;
  smoothedMonthly: number;
  remainingThisMonth: number;
  month: number;
  projection: ProjectionMonth[];
  categories: CategoryLoad[];
  /** Toutes les catégories de l'utilisateur, pour nommer et teinter. */
  categoryList: Category[];
  /** Flux catégorie → fournisseur, pour le Sankey. */
  flows: CategoryProviderFlow[];
  top: { contract: CalendarContract; monthlyCost: number }[];
  days: DayLoad[];
  renewals: Renewal[];
  today: Date;
}

export default function DashboardView({ data }: { data: DashboardData }) {
  const {
    contractCount,
    providerCount,
    smoothedMonthly,
    remainingThisMonth,
    month,
    projection,
    categories,
    categoryList,
    flows,
    top,
    days,
    renewals,
    today,
  } = data;

  const hasData = contractCount > 0;

  return (
    <Stack spacing={2.5} sx={{ pt: 3, pb: 5 }}>
      <Box component="section" aria-label="Indicateurs" sx={statGridSx}>
        <StatCard
          label="Coût mensuel lissé"
          value={formatEuro(round(smoothedMonthly))}
          note="Trimestriels et annuels ramenés au mois"
        />
        <StatCard
          label="Sur l'année"
          value={formatEuro(Math.round(smoothedMonthly * 12))}
          note="12 fois le coût lissé"
        />
        <StatCard
          label="Contrats actifs"
          value={String(contractCount)}
          note={`${providerCount} fournisseur${providerCount > 1 ? "s" : ""}`}
        />
        <StatCard
          label={`Reste en ${MONTHS[month]}`}
          value={formatEuro(round(remainingThisMonth))}
          note="À partir d'aujourd'hui"
        />
      </Box>

      {!hasData ? (
        <Card title="Rien à afficher">
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Ajoute un premier contrat : le tableau de bord se construit
            entièrement à partir de tes échéances.
          </Typography>
        </Card>
      ) : (
        <>
          <Row>
            <ProjectionChart projection={projection} />
            <CategoryChart categories={categories} total={smoothedMonthly} />
          </Row>
          <Row>
            <DayChart days={days} month={month} />
            <RenewalList
              renewals={renewals}
              categories={categoryList}
              today={today}
            />
          </Row>
          <Card
            title="Du coût mensuel aux fournisseurs"
            intro="Le coût mensuel lissé se répartit par catégorie, puis chaque catégorie par fournisseur. Survolez un flux pour son montant."
          >
            <SankeyChart flows={flows} categories={categoryList} />
          </Card>
          <TopTable
            top={top}
            total={smoothedMonthly}
            categories={categoryList}
          />
        </>
      )}
    </Stack>
  );
}

// Couleurs des graphiques, prises au thème : le socle suit l'accent (trait
// lisible sur la carte dans les deux thèmes), les échéances ponctuelles
// l'ambre. Les deux diffèrent aussi en luminosité, pas seulement en teinte.
const CHART_BASE = "primary.main";
const CHART_EXTRA = "primary.dark";

const round = (n: number) => Math.round(n * 100) / 100;

/** Deux cartes côte à côte : la première prend la place, la seconde passe dessous sur écran étroit. */
function Row({ children }: { children: [React.ReactNode, React.ReactNode] }) {
  return (
    <Stack direction="row" flexWrap="wrap" gap={2.5} alignItems="stretch">
      <Box sx={{ flex: "999 1 560px", minWidth: 0, display: "flex" }}>
        {children[0]}
      </Box>
      <Box sx={{ flex: "1 1 320px", minWidth: 0, display: "flex" }}>
        {children[1]}
      </Box>
    </Stack>
  );
}

function Card({
  title,
  legend,
  intro,
  children,
  flush,
}: {
  title: string;
  legend?: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
  /** Contenu bord à bord (tableau) : pas de marge intérieure autour. */
  flush?: boolean;
}) {
  return (
    <Box
      component="section"
      sx={{
        flex: 1,
        minWidth: 0,
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
        p: flush ? 0 : { xs: 2, sm: 2.75 },
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: flush ? { xs: 2, sm: 2.75 } : 0, pb: flush ? 1.5 : 0 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          flexWrap="wrap"
          gap={1.5}
          sx={{ mb: 0.75 }}
        >
          <Typography component="h2" sx={{ fontWeight: 600, fontSize: 16 }}>
            {title}
          </Typography>
          {legend}
        </Stack>
        {intro && (
          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.55,
              mb: 2.25,
              maxWidth: "70ch",
            }}
          >
            {intro}
          </Typography>
        )}
      </Box>
      {children}
    </Box>
  );
}

function Swatch({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: 0.75,
          bgcolor: color,
          flex: "none",
        }}
      />
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        {children}
      </Typography>
    </Stack>
  );
}

// ---------- Projection : colonnes empilées, deux séries ----------
function ProjectionChart({ projection }: { projection: ProjectionMonth[] }) {
  const max = Math.max(...projection.map((p) => p.total), 1);
  const base = projection[0]?.base ?? 0;

  return (
    <Card
      title="Ce qui sera prélevé, mois par mois"
      legend={
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Swatch color={CHART_BASE}>Socle mensuel</Swatch>
          <Swatch color={CHART_EXTRA}>Trimestriel ou annuel</Swatch>
        </Stack>
      }
      intro={
        <>
          Le socle ne bouge pas : {formatEuro(round(base))} chaque mois. Ce qui
          varie, ce sont les échéances trimestrielles et annuelles — elles
          seules créent les mois chers.
        </>
      }
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: { xs: 0.5, sm: 1.25 },
          height: 220,
        }}
      >
        {projection.map((p) => (
          <Tooltip
            key={`${p.year}-${p.month}`}
            arrow
            title={
              <Box sx={{ fontSize: 12 }}>
                {MONTHS[p.month]} {p.year} — <b>{formatEuro(round(p.total))}</b>
                {p.extra > 0 && (
                  <>
                    <br />
                    dont {formatEuro(p.extra)} :{" "}
                    {p.extras.map((c) => c.name).join(", ")}
                  </>
                )}
              </Box>
            }
          >
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                cursor: "default",
                "&:hover .bar": { filter: "brightness(1.12)" },
              }}
            >
              {p.extra > 0 && (
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "text.secondary",
                    textAlign: "center",
                    mb: 0.5,
                    whiteSpace: "nowrap",
                    display: { xs: "none", md: "block" },
                  }}
                >
                  +{formatEuro(Math.round(p.extra))}
                </Typography>
              )}
              {/* 2px entre les deux segments : ils restent distincts même collés */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  flex: 1,
                  justifyContent: "flex-end",
                }}
              >
                {p.extra > 0 && (
                  <Box
                    className="bar"
                    sx={{
                      height: `${(p.extra / max) * 100}%`,
                      bgcolor: CHART_EXTRA,
                      borderRadius: "6px 6px 2px 2px",
                    }}
                  />
                )}
                <Box
                  className="bar"
                  sx={{
                    height: `${(p.base / max) * 100}%`,
                    bgcolor: CHART_BASE,
                    borderRadius: p.extra > 0 ? "2px 2px 6px 6px" : "6px",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  textAlign: "center",
                  mt: 1,
                }}
              >
                {MONTHS_SHORT[p.month]}
              </Typography>
            </Box>
          </Tooltip>
        ))}
      </Box>
    </Card>
  );
}

// ---------- Catégories : une seule teinte, on compare des longueurs ----------
function CategoryChart({
  categories,
  total,
}: {
  categories: CategoryLoad[];
  total: number;
}) {
  const max = categories[0]?.monthlyCost ?? 1;
  return (
    <Card
      title="Où part l'argent"
      intro="Coût mensuel lissé par catégorie. La pastille dit de quelle catégorie il s'agit, la barre combien elle pèse."
    >
      <Stack spacing={1.75}>
        {categories.map((c) => (
          <Tooltip
            key={c.slug}
            arrow
            title={
              <Box sx={{ fontSize: 12 }}>
                {c.label} — <b>{formatEuro(round(c.monthlyCost))}</b> par mois
                <br />
                {c.count} contrat{c.count > 1 ? "s" : ""}
              </Box>
            }
          >
            <Stack spacing={0.75} sx={{ cursor: "default" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                spacing={1.5}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  sx={{ minWidth: 0 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: 0.75,
                      bgcolor: c.color,
                      flex: "none",
                    }}
                  />
                  <Typography sx={{ fontSize: 13 }} noWrap title={c.label}>
                    {c.label}
                  </Typography>
                  <Typography
                    sx={{ fontSize: 12, color: "text.secondary", flex: "none" }}
                  >
                    · {c.count}
                  </Typography>
                </Stack>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}
                >
                  {formatEuro(Math.round(c.monthlyCost))}
                  <Box
                    component="span"
                    sx={{ color: "text.secondary", fontWeight: 400, ml: 0.75 }}
                  >
                    {Math.round((c.monthlyCost / total) * 100)} %
                  </Box>
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 8,
                  bgcolor: "action.hover",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${(c.monthlyCost / max) * 100}%`,
                    bgcolor: CHART_BASE,
                    borderRadius: 999,
                  }}
                />
              </Box>
            </Stack>
          </Tooltip>
        ))}
      </Stack>
    </Card>
  );
}

/** Part du jour le plus chargé au-delà de laquelle le montant s'écrit sur la barre. */
const LABEL_SHARE = 0.15;
const BARS_HEIGHT = 200;

// ---------- Charge par jour : une barre par jour ----------
function DayChart({ days, month }: { days: DayLoad[]; month: number }) {
  const max = Math.max(...days.map((d) => d.total), 1);
  const peak = days.reduce((a, b) => (b.total > a.total ? b : a), days[0]);
  const total = days.reduce((s, d) => s + d.total, 0);

  return (
    <Card
      title="Quand l'argent part dans le mois"
      intro={
        total > 0 ? (
          <>
            Le {peak.day} concentre {formatEuro(Math.round(peak.total))}, soit{" "}
            {Math.round((peak.total / total) * 100)} % du mois : c&apos;est le
            jour où le compte doit être garni.
          </>
        ) : (
          "Aucun prélèvement sur le mois en cours."
        )
      }
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
          columnGap: { xs: "2px", sm: "4px" },
        }}
      >
        {days.map((d) => {
          const labelled = d.total > 0 && (d.day === peak.day || d.total >= max * LABEL_SHARE);
          return (
            <Tooltip
              key={d.day}
              arrow
              disableHoverListener={d.total === 0}
              title={
                <Box sx={{ fontSize: 12 }}>
                  {d.day} {MONTHS[month]} — <b>{formatEuro(round(d.total))}</b>
                  <br />
                  {d.names.join(", ")}
                </Box>
              }
            >
              <Stack sx={{ cursor: "default", minWidth: 0 }}>
                <Stack justifyContent="flex-end" alignItems="center" sx={{ height: BARS_HEIGHT, borderBottom: 1, borderColor: "divider" }}>
                  {labelled && (
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: d.day === peak.day ? 700 : 600,
                        whiteSpace: "nowrap",
                        mb: 0.5,
                        display: { xs: d.day === peak.day ? "block" : "none", sm: "block" },
                      }}
                    >
                      {formatEuro(Math.round(d.total))}
                    </Typography>
                  )}
                  {d.total > 0 && (
                    <Box
                      sx={{
                        width: "100%",
                        maxWidth: 22,
                        // Un petit montant reste visible : 4 px au minimum.
                        height: Math.max(4, Math.round((d.total / max) * (BARS_HEIGHT - 24))),
                        bgcolor: CHART_EXTRA,
                        borderRadius: "4px 4px 0 0",
                      }}
                    />
                  )}
                </Stack>
                <Typography
                  sx={{
                    fontSize: 11,
                    textAlign: "center",
                    mt: 0.75,
                    color: d.total > 0 ? "text.primary" : "text.secondary",
                    fontWeight: d.total > 0 ? 600 : 400,
                    visibility: {
                      xs: d.day === 1 || d.day % 5 === 0 ? "visible" : "hidden",
                      md: "visible",
                    },
                  }}
                >
                  {d.day}
                </Typography>
              </Stack>
            </Tooltip>
          );
        })}
      </Box>
    </Card>
  );
}

// ---------- Renouvellements : une liste, pas un graphique ----------
function RenewalList({
  renewals,
  categories,
  today,
}: {
  renewals: Renewal[];
  categories: Category[];
  today: Date;
}) {
  const overdue = renewals.filter((r) => r.overdue).length;

  return (
    <Card
      title="Renouvellements"
      intro={
        renewals.length
          ? undefined
          : "Aucune date de renouvellement renseignée."
      }
    >
      <Stack>
        {renewals.map((r) => (
          <Stack
            key={r.contract.id}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ py: 1.25, "& + &": { borderTop: 1, borderColor: "divider" } }}
          >
            <ContractAvatar
              contract={r.contract}
              category={findCategory(categories, r.contract.category)}
              size={36}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                title={r.contract.name}
                sx={{ fontWeight: 600, fontSize: 14 }}
                noWrap
              >
                {r.contract.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
                {new Date(r.date).toLocaleDateString("fr-FR")} ·{" "}
                {formatEuro(r.contract.amount)}
              </Typography>
            </Box>
            {r.overdue ? (
              <Chip
                label="date dépassée"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: 11 }}
              />
            ) : (
              <Box
                component="span"
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  whiteSpace: "nowrap",
                }}
              >
                {relativeDay(new Date(r.date), today).toLowerCase()}
              </Box>
            )}
          </Stack>
        ))}
      </Stack>

      {overdue > 0 && (
        <Typography
          sx={{
            mt: 1.75,
            p: 1.5,
            borderRadius: 1,
            fontSize: 12,
            lineHeight: 1.55,
            border: 1,
            borderColor: "rgba(var(--mui-palette-warning-mainChannel) / 0.45)",
            bgcolor: "rgba(var(--mui-palette-warning-mainChannel) / 0.08)",
          }}
        >
          <b>
            {overdue} date{overdue > 1 ? "s" : ""} dépassée
            {overdue > 1 ? "s" : ""}.
          </b>{" "}
          Rien n&apos;avance la date de renouvellement une fois l&apos;échéance
          passée : la donnée se périme en silence.
        </Typography>
      )}
    </Card>
  );
}

// ---------- Contrats les plus lourds : un tableau ----------
function TopTable({
  top,
  total,
  categories,
}: {
  top: { contract: CalendarContract; monthlyCost: number }[];
  total: number;
  categories: Category[];
}) {
  const share = Math.round(((top[0]?.monthlyCost ?? 0) / total) * 100);
  const thSx = {
    px: 1.5,
    py: 1.25,
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: "text.secondary",
    textAlign: "left",
  } as const;

  return (
    <Card
      flush
      title={`Les ${top.length} postes les plus lourds`}
      intro={
        <>
          {top[0]?.contract.name} pèse à lui seul {share} % du coût mensuel.
        </>
      }
    >
      <Box sx={{ overflowX: "auto" }}>
        <Box
          component="table"
          sx={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}
        >
          <Box component="thead" sx={{ bgcolor: "background.default" }}>
            <tr>
              <Box
                component="th"
                scope="col"
                sx={{ ...thSx, pl: { xs: 2, sm: 2.75 } }}
              >
                Contrat
              </Box>
              <Box component="th" scope="col" sx={thSx}>
                Catégorie
              </Box>
              <Box component="th" scope="col" sx={thSx}>
                Fréquence
              </Box>
              <Box
                component="th"
                scope="col"
                sx={{ ...thSx, textAlign: "right" }}
              >
                Montant
              </Box>
              <Box
                component="th"
                scope="col"
                sx={{ ...thSx, textAlign: "right", pr: { xs: 2, sm: 2.75 } }}
              >
                Par mois
              </Box>
            </tr>
          </Box>
          <tbody>
            {top.map((t) => {
              const category = findCategory(categories, t.contract.category);
              return (
                <Box
                  component="tr"
                  key={t.contract.id}
                  sx={{ borderTop: 1, borderColor: "divider" }}
                >
                  <Box
                    component="td"
                    sx={{ px: 1.5, py: 1.5, pl: { xs: 2, sm: 2.75 } }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <ContractAvatar
                        contract={t.contract}
                        category={category}
                        size={34}
                      />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {t.contract.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          {t.contract.provider}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  <Box component="td" sx={{ px: 1.5 }}>
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 0.75,
                        fontSize: 12,
                        px: 1.25,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: 0.5,
                          bgcolor: category.color,
                        }}
                      />
                      {category.label}
                    </Box>
                  </Box>
                  <Box
                    component="td"
                    sx={{ px: 1.5, fontSize: 14, color: "text.secondary" }}
                  >
                    {getFrequencyLabel(t.contract.frequency)}
                  </Box>
                  <Box
                    component="td"
                    sx={{ px: 1.5, fontSize: 14, textAlign: "right" }}
                  >
                    {formatEuro(t.contract.amount)}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      px: 1.5,
                      pr: { xs: 2, sm: 2.75 },
                      fontSize: 14,
                      fontWeight: 700,
                      textAlign: "right",
                    }}
                  >
                    {formatEuro(round(t.monthlyCost))}
                  </Box>
                </Box>
              );
            })}
          </tbody>
        </Box>
      </Box>
    </Card>
  );
}
