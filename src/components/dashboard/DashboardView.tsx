"use client";

import { Box, Chip, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { CHART_BASE, CHART_EXTRA, CHART_MUTED } from "@/lib/theme";
import { formatEuro, type CalendarContract } from "@/modules/contracts/calendar";
import type {
  CategoryLoad,
  DayLoad,
  ProjectionMonth,
  Renewal,
} from "@/modules/contracts/dashboard";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const MONTHS_SHORT = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

export interface DashboardData {
  contractCount: number;
  providerCount: number;
  smoothedMonthly: number;
  remainingThisMonth: number;
  month: number;
  projection: ProjectionMonth[];
  categories: CategoryLoad[];
  top: { contract: CalendarContract; monthlyCost: number }[];
  days: DayLoad[];
  renewals: Renewal[];
}

export default function DashboardView({ data }: { data: DashboardData }) {
  const {
    contractCount, providerCount, smoothedMonthly, remainingThisMonth,
    month, projection, categories, top, days, renewals,
  } = data;

  const hasData = contractCount > 0;

  return (
    <Stack spacing={2.75} sx={{ pt: 2.25, pb: 5 }}>
      <Box
        sx={{
          display: "grid",
          gap: 1.25,
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        }}
      >
        <Kpi
          label="Coût mensuel lissé"
          value={formatEuro(round(smoothedMonthly))}
          note="Trimestriels et annuels ramenés au mois"
        />
        <Kpi
          label="Sur l'année"
          value={formatEuro(Math.round(smoothedMonthly * 12))}
          note="12 fois le coût lissé"
        />
        <Kpi
          label="Contrats actifs"
          value={String(contractCount)}
          note={`${providerCount} fournisseur${providerCount > 1 ? "s" : ""}`}
        />
        <Kpi
          label={`Reste en ${MONTHS[month]}`}
          value={formatEuro(round(remainingThisMonth))}
          note="À partir d'aujourd'hui"
        />
      </Box>

      {!hasData ? (
        <Card title="Rien à afficher">
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Ajoute un premier contrat : le tableau de bord se construit
            entièrement à partir de tes échéances.
          </Typography>
        </Card>
      ) : (
        <>
          <ProjectionChart projection={projection} />
          <CategoryChart categories={categories} total={smoothedMonthly} />
          <TopChart top={top} total={smoothedMonthly} />
          <DayChart days={days} month={month} />
          <RenewalList renewals={renewals} />
        </>
      )}
    </Stack>
  );
}

const round = (n: number) => Math.round(n * 100) / 100;

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 2.5 }}>
      <Typography
        sx={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5c6675" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "var(--font-mono)", fontSize: 21, fontWeight: 500, mt: 0.75,
          fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: 0.4, lineHeight: 1.4 }}>
        {note}
      </Typography>
    </Paper>
  );
}

function Card({
  title,
  legend,
  intro,
  children,
}: {
  title: string;
  legend?: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        flexWrap="wrap"
        gap={1.5}
        sx={{ mb: 0.5 }}
      >
        <Typography
          component="h2"
          sx={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14.5 }}
        >
          {title}
        </Typography>
        {legend}
      </Stack>
      {intro && (
        <Typography
          sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.55, mb: 2, maxWidth: "70ch" }}
        >
          {intro}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

function Swatch({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.75}>
      <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: color, flex: "none" }} />
      <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{children}</Typography>
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
          varie, ce sont les échéances trimestrielles et annuelles — elles seules
          créent les mois chers.
        </>
      }
    >
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.75, height: 190 }}>
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
                    dont {formatEuro(p.extra)} : {p.extras.map((c) => c.name).join(", ")}
                  </>
                )}
              </Box>
            }
          >
            <Box
              sx={{
                flex: 1, minWidth: 0, height: "100%",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                cursor: "default",
                "&:hover > div": { filter: "brightness(1.18)" },
              }}
            >
              {p.extra > 0 && (
                <Typography
                  sx={{
                    fontFamily: "var(--font-mono)", fontSize: 9.5, color: CHART_EXTRA,
                    textAlign: "center", mb: 0.5, whiteSpace: "nowrap",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  +{formatEuro(p.extra)}
                </Typography>
              )}
              {/* 2px entre les deux segments : ils restent distincts même collés */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, justifyContent: "flex-end" }}>
                {p.extra > 0 && (
                  <Box
                    sx={{
                      height: `${(p.extra / max) * 100}%`,
                      bgcolor: CHART_EXTRA,
                      borderRadius: "4px 4px 0 0",
                    }}
                  />
                )}
                <Box
                  sx={{
                    height: `${(p.base / max) * 100}%`,
                    bgcolor: CHART_BASE,
                    borderRadius: p.extra > 0 ? 0 : "4px 4px 0 0",
                  }}
                />
              </Box>
              <Typography
                sx={{ fontSize: 10, color: "#5c6675", textAlign: "center", mt: 0.9 }}
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

// ---------- Barres horizontales réutilisables ----------
function BarRow({
  name,
  width,
  value,
  pct,
  muted,
  tooltip,
}: {
  name: string;
  width: number;
  value: string;
  pct?: string;
  muted?: boolean;
  tooltip: React.ReactNode;
}) {
  return (
    <Tooltip arrow title={tooltip}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(72px,96px) minmax(0,1fr) auto", sm: "minmax(84px,130px) minmax(0,1fr) auto" },
          alignItems: "center",
          gap: { xs: 1, sm: 1.4 },
          cursor: "default",
          "&:hover .fill": { filter: "brightness(1.18)" },
        }}
      >
        <Typography
          title={name}
          sx={{ fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {name}
        </Typography>
        <Box sx={{ height: 12, bgcolor: "rgba(255,255,255,0.045)", borderRadius: 1, overflow: "hidden" }}>
          <Box
            className="fill"
            sx={{
              height: "100%",
              width: `${width}%`,
              bgcolor: muted ? CHART_MUTED : CHART_BASE,
              borderRadius: 1,
            }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: "var(--font-mono)", fontSize: 12, color: "text.secondary",
            fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
          }}
        >
          {value}
          {pct && <Box component="span" sx={{ color: "#5c6675", fontSize: 10.5, ml: 0.5 }}>{pct}</Box>}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function CategoryChart({ categories, total }: { categories: CategoryLoad[]; total: number }) {
  const max = categories[0]?.monthlyCost ?? 1;
  return (
    <Card
      title="Où part l'argent"
      intro="Coût mensuel lissé par catégorie. Une seule teinte : on compare des longueurs, le nom est écrit en face de chaque barre."
    >
      <Stack spacing={1.1}>
        {categories.map((c) => (
          <BarRow
            key={c.slug}
            name={c.label}
            width={(c.monthlyCost / max) * 100}
            value={formatEuro(Math.round(c.monthlyCost))}
            pct={`${Math.round((c.monthlyCost / total) * 100)}%`}
            tooltip={
              <Box sx={{ fontSize: 12 }}>
                {c.label} — <b>{formatEuro(round(c.monthlyCost))}</b> par mois
                <br />
                {c.count} contrat{c.count > 1 ? "s" : ""}
              </Box>
            }
          />
        ))}
      </Stack>
    </Card>
  );
}

const FREQ: Record<string, string> = {
  monthly: "mensuel",
  quarterly: "trimestriel",
  annual: "annuel",
  once: "ponctuel",
};

function TopChart({
  top,
  total,
}: {
  top: { contract: CalendarContract; monthlyCost: number }[];
  total: number;
}) {
  const max = top[0]?.monthlyCost ?? 1;
  const share = Math.round((max / total) * 100);
  return (
    <Card
      title={`Les ${top.length} postes les plus lourds`}
      intro={
        <>
          {top[0]?.contract.name} pèse à lui seul {share} % du total. Le mettre en
          avant et estomper les autres dit cela d&apos;un coup d&apos;œil.
        </>
      }
    >
      <Stack spacing={1.1}>
        {top.map((t, i) => (
          <BarRow
            key={t.contract.id}
            name={t.contract.name}
            width={(t.monthlyCost / max) * 100}
            value={formatEuro(Math.round(t.monthlyCost))}
            muted={i > 0}
            tooltip={
              <Box sx={{ fontSize: 12 }}>
                {t.contract.name} — <b>{formatEuro(round(t.monthlyCost))}</b> par mois
                <br />
                {t.contract.provider} · {FREQ[t.contract.frequency] ?? t.contract.frequency}
              </Box>
            }
          />
        ))}
      </Stack>
    </Card>
  );
}

// ---------- Charge par jour ----------
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
            {Math.round((peak.total / total) * 100)} % du mois. C&apos;est une
            information de trésorerie : elle dit quel jour le compte doit être garni.
          </>
        ) : (
          "Aucun prélèvement sur le mois en cours."
        )
      }
    >
      <Box sx={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 96 }}>
        {days.map((d) => (
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
            <Box
              sx={{
                flex: 1, minWidth: 0, height: "100%",
                display: "flex", flexDirection: "column", justifyContent: "flex-end",
                "&:hover > div": { filter: "brightness(1.25)" },
              }}
            >
              <Box
                sx={{
                  height: d.total ? `${Math.max((d.total / max) * 100, 3)}%` : "2%",
                  bgcolor: d.total ? CHART_BASE : "rgba(255,255,255,0.055)",
                  borderRadius: "3px 3px 0 0",
                }}
              />
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Box sx={{ display: "flex", gap: "2px", mt: 0.75 }}>
        {days.map((d) => (
          <Typography
            key={d.day}
            sx={{
              flex: 1, minWidth: 0, textAlign: "center", fontSize: 9, color: "#5c6675",
              fontVariantNumeric: "tabular-nums",
              visibility: { xs: d.day % 2 ? "visible" : "hidden", sm: "visible" },
            }}
          >
            {d.day}
          </Typography>
        ))}
      </Box>
    </Card>
  );
}

// ---------- Renouvellements : une liste, pas un graphique ----------
function RenewalList({ renewals }: { renewals: Renewal[] }) {
  const overdue = renewals.filter((r) => r.overdue).length;

  return (
    <Card
      title="Renouvellements"
      intro={
        renewals.length
          ? "Trop peu de dates pour un graphique, qui serait surtout du vide. Une liste datée fait mieux le travail."
          : "Aucune date de renouvellement renseignée."
      }
    >
      <Stack>
        {renewals.map((r) => (
          <Stack
            key={r.contract.id}
            direction="row"
            alignItems="baseline"
            spacing={1.5}
            sx={{ py: 1, "& + &": { boxShadow: "0 -1px 0 #1e2029" } }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-mono)", fontSize: 12, color: "text.secondary",
                fontVariantNumeric: "tabular-nums", width: 86, flex: "none",
              }}
            >
              {r.date.toLocaleDateString("fr-FR")}
            </Typography>
            <Typography
              title={r.contract.name}
              sx={{ flex: 1, minWidth: 0, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {r.contract.name}
            </Typography>
            {r.overdue ? (
              <Chip
                label="date dépassée"
                size="small"
                variant="outlined"
                sx={{ height: 18, fontSize: 10, borderColor: CHART_EXTRA, color: CHART_EXTRA }}
              />
            ) : (
              <Typography
                sx={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "text.secondary", fontVariantNumeric: "tabular-nums" }}
              >
                {formatEuro(r.contract.amount)}
              </Typography>
            )}
          </Stack>
        ))}
      </Stack>

      {overdue > 0 && (
        <Typography
          sx={{
            mt: 1.75, p: 1.25, borderRadius: 1.5, fontSize: 12, lineHeight: 1.55,
            border: 1, borderColor: "rgba(217,119,6,0.35)",
            bgcolor: "rgba(217,119,6,0.08)", color: "#fcd9a0",
          }}
        >
          <b>
            {overdue} date{overdue > 1 ? "s" : ""} dépassée{overdue > 1 ? "s" : ""}.
          </b>{" "}
          Rien n&apos;avance la date de renouvellement une fois l&apos;échéance
          passée : la donnée se périme en silence.
        </Typography>
      )}
    </Card>
  );
}
