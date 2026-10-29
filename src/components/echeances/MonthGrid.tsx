"use client";

import { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  daysInMonth,
  formatEuro,
  getMonthOccurrences,
  relativeDay,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import { getFrequencyLabel } from "@/modules/contracts/categories";
import { findCategory, type Category } from "@/modules/categories/model";
import ContractAvatar from "@/components/contracts/ContractAvatar";
import { cardSx, insetSx, scrollBoxSx } from "@/components/ui/surface";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];
const WEEKDAY_FORMAT = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });
const SHORT_FORMAT = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
/** Pastilles visibles dans une case avant le « +N ». */
const MAX_AVATARS = 3;

const euro = (n: number) => formatEuro(Math.round(n * 100) / 100);


interface MonthGridProps {
  contracts: CalendarContract[];
  categories: Category[];
  year: number;
  month: number;
  today: Date;
  /** Ouvre le contrat depuis une ligne du détail du jour. */
  onSelect: (contract: CalendarContract) => void;
}

/**
 * Lire la répartition des prélèvements dans le mois. Une case porte le
 * total du jour et son poids dans le mois ; le détail du jour sélectionné
 * vit dans le panneau d'à côté, sans popup à refermer.
 */
export default function MonthGrid({
  contracts,
  categories,
  year,
  month,
  today,
  onSelect,
}: MonthGridProps) {
  const byDay = new Map<number, CalendarContract[]>();
  for (const { date, contract } of getMonthOccurrences(contracts, year, month)) {
    const day = date.getDate();
    byDay.set(day, [...(byDay.get(day) ?? []), contract]);
  }
  const totalOf = (day: number) =>
    (byDay.get(day) ?? []).reduce((s, c) => s + c.amount, 0);
  const debitDays = [...byDay.keys()].sort((a, b) => a - b);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();
  const todayDay = isCurrentMonth ? today.getDate() : 0;
  const isPast = (day: number) =>
    isCurrentMonth ? day < todayDay : new Date(year, month, day) < today;

  // Par défaut : le prochain jour prélevé, sinon le dernier du mois.
  const [selected, setSelected] = useState<number | null>(
    () => debitDays.find((d) => !isPast(d)) ?? debitDays.at(-1) ?? null,
  );

  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthTotal = debitDays.reduce((s, d) => s + totalOf(d), 0);
  const paid = debitDays.filter(isPast).reduce((s, d) => s + totalOf(d), 0);
  const maxDay = Math.max(0, ...debitDays.map(totalOf));

  return (
    // Même règle que la liste : à partir de md, la grille et le détail du
    // jour se partagent la hauteur de l'écran et défilent chacun seul.
    <Stack
      direction="row"
      flexWrap={{ xs: "wrap", md: "nowrap" }}
      gap={2.5}
      alignItems={{ xs: "flex-start", md: "stretch" }}
      sx={{ flex: { md: "1 1 0" }, minHeight: { md: 420 } }}
    >
      <Box
        component="section"
        aria-label={`Calendrier de ${MONTHS[month]} ${year}`}
        sx={{ ...cardSx, ...scrollBoxSx, flex: "999 1 560px", minWidth: 0, p: { xs: 1.5, md: 3 } }}
      >
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="space-between"
          alignItems="center"
          gap={1.5}
          sx={{ mb: 1.75 }}
        >
          <Typography component="h2" sx={{ fontSize: 21, fontWeight: 400, textTransform: "capitalize" }}>
            {MONTHS[month]} {year}
          </Typography>
          <Stack direction="row" flexWrap="wrap" columnGap={2.25} rowGap={0.5} sx={{ fontSize: 13, color: "text.secondary" }}>
            <span>Total <Box component="strong" sx={{ color: "text.primary" }}>{euro(monthTotal)}</Box></span>
            <span>Prélevé <Box component="strong" sx={{ color: "text.primary" }}>{euro(paid)}</Box></span>
            <span>Reste <Box component="strong" sx={{ color: "primary.dark", ".dark &": { color: "primary.light" } }}>{euro(monthTotal - paid)}</Box></span>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: { xs: 0.5, md: 1 },
          }}
        >
          {WEEKDAYS.map((d) => (
            <Typography
              key={d}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "text.secondary",
                textAlign: "center",
                pb: 0.5,
              }}
            >
              {d}
            </Typography>
          ))}

          {cells.map((day, i) => {
            if (day === null) return <Box key={`blank-${i}`} />;
            const list = byDay.get(day) ?? [];
            const total = totalOf(day);
            const isToday = day === todayDay;
            const isSelected = day === selected;
            const past = isPast(day);
            const clickable = list.length > 0;

            return (
              <Box
                key={day}
                component={clickable ? "button" : "div"}
                type={clickable ? "button" : undefined}
                aria-pressed={clickable ? isSelected : undefined}
                aria-label={
                  clickable
                    ? `${day} ${MONTHS[month]} : ${formatEuro(total)}, ${list.length} prélèvement${
                        list.length > 1 ? "s" : ""
                      }`
                    : undefined
                }
                data-testid={`calendar-day-${day}`}
                onClick={clickable ? () => setSelected(day) : undefined}
                sx={{
                  height: { xs: 52, md: 112 },
                  minWidth: 0,
                  p: { xs: 0.5, md: 1.25 },
                  border: isSelected ? 2 : 1,
                  borderColor: isSelected ? "primary.dark" : "divider",
                  borderRadius: 1,
                  bgcolor: isSelected
                    ? "rgba(var(--mui-palette-primary-mainChannel) / 0.06)"
                    : "background.paper",
                  color: "text.primary",
                  font: "inherit",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: { xs: "center", md: "stretch" },
                  overflow: "hidden",
                  cursor: clickable ? "pointer" : "default",
                  "&:hover": clickable ? { borderColor: "primary.dark" } : undefined,
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box
                    component="span"
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 13,
                      fontWeight: 600,
                      bgcolor: isToday ? "primary.dark" : "transparent",
                      color: isToday ? "common.white" : past ? "text.secondary" : "text.primary",
                      ".dark &": isToday ? { bgcolor: "primary.main", color: "primary.contrastText" } : {},
                    }}
                  >
                    {day}
                  </Box>
                  <Stack direction="row" sx={{ display: { xs: "none", md: "flex" }, pl: 0.75 }}>
                    {list.slice(0, MAX_AVATARS).map((c, k) => (
                      <Box key={`${c.id}-${k}`} sx={{ ml: -0.75, borderRadius: "50%", border: 2, borderColor: "background.paper" }}>
                        <ContractAvatar contract={c} category={findCategory(categories, c.category)} size={22} />
                      </Box>
                    ))}
                    {list.length > MAX_AVATARS && (
                      <Typography sx={{ fontSize: 11, color: "text.secondary", ml: 0.5, alignSelf: "center" }}>
                        +{list.length - MAX_AVATARS}
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                {total > 0 && (
                  <>
                    {/* Sur mobile, un point suffit : le montant ne tient pas. */}
                    <Box
                      aria-hidden
                      sx={{
                        display: { xs: "block", md: "none" },
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: past ? "text.secondary" : "primary.dark",
                      }}
                    />
                    <Stack spacing={0.75} sx={{ display: { xs: "none", md: "flex" } }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: past ? "text.secondary" : "text.primary",
                        }}
                      >
                        {formatEuro(total)}
                      </Typography>
                      <Box sx={{ height: 4, borderRadius: 999, bgcolor: "action.hover", overflow: "hidden" }}>
                        <Box
                          sx={{
                            height: "100%",
                            borderRadius: 999,
                            width: `${(total / maxDay) * 100}%`,
                            bgcolor: past ? "text.disabled" : "primary.dark",
                          }}
                        />
                      </Box>
                    </Stack>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      <DayPanel
        day={selected}
        year={year}
        month={month}
        today={today}
        list={selected !== null ? (byDay.get(selected) ?? []) : []}
        next={debitDays
          .filter((d) => selected !== null && d > selected)
          .slice(0, 3)
          .map((d) => ({ day: d, names: (byDay.get(d) ?? []).map((c) => c.name), total: totalOf(d) }))}
        categories={categories}
        onSelect={onSelect}
      />
    </Stack>
  );
}

const dayPanelSx = {
  ...scrollBoxSx,
  flex: { xs: "1 1 280px", md: "0 0 340px" },
  minWidth: 0,
  "& > *": { flexShrink: 0 },
} as const;

function DayPanel({
  day,
  year,
  month,
  today,
  list,
  next,
  categories,
  onSelect,
}: {
  day: number | null;
  year: number;
  month: number;
  today: Date;
  list: CalendarContract[];
  next: { day: number; names: string[]; total: number }[];
  categories: Category[];
  onSelect: (contract: CalendarContract) => void;
}) {
  if (day === null) {
    return (
      <Box component="aside" aria-label="Détail du jour" sx={{ ...cardSx, ...dayPanelSx, p: 3 }}>
        <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
          Aucun prélèvement ce mois-ci.
        </Typography>
      </Box>
    );
  }

  const date = new Date(year, month, day);
  const total = list.reduce((s, c) => s + c.amount, 0);

  return (
    <Stack
      component="aside"
      aria-label="Détail du jour"
      spacing={2}
      sx={{ ...cardSx, ...dayPanelSx, p: 3 }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography sx={{ fontSize: 13, color: "text.secondary", textTransform: "capitalize" }}>
            {WEEKDAY_FORMAT.format(date)}
          </Typography>
          <Typography component="h2" sx={{ fontSize: 24, fontWeight: 400, letterSpacing: "-0.02em" }}>
            {day} {MONTHS[month]}
          </Typography>
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: 13,
            fontWeight: 500,
            px: 1.25,
            py: 0.5,
            borderRadius: 999,
            border: 1,
            borderColor: "divider",
          }}
        >
          {relativeDay(date, today)}
        </Box>
      </Stack>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ ...insetSx, px: 2, py: 1.75 }}
      >
        <Typography sx={{ color: "text.secondary" }}>Total du jour</Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em" }}>{euro(total)}</Typography>
      </Stack>

      <Stack spacing={0.5}>
        {list.map((contract, i) => (
          <Stack
            key={`${contract.id}-${i}`}
            component="button"
            type="button"
            direction="row"
            alignItems="center"
            spacing={1.5}
            onClick={() => onSelect(contract)}
            sx={{
              width: "100%",
              p: 1,
              mx: -1,
              border: 0,
              borderRadius: 1,
              bgcolor: "transparent",
              color: "text.primary",
              font: "inherit",
              textAlign: "left",
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            <ContractAvatar contract={contract} category={findCategory(categories, contract.category)} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography title={contract.name} sx={{ fontWeight: 600 }} noWrap>
                {contract.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
                {findCategory(categories, contract.category).label} ·{" "}
                {getFrequencyLabel(contract.frequency).toLowerCase()}
              </Typography>
            </Box>
            <Typography sx={{ fontWeight: 500, whiteSpace: "nowrap" }}>
              {formatEuro(contract.amount)}
            </Typography>
          </Stack>
        ))}
      </Stack>

      {next.length > 0 && (
        <>
          <Box sx={{ height: "1px", bgcolor: "divider" }} />
          <Typography
            component="h3"
            sx={{ fontSize: 13, color: "text.secondary" }}
          >
            Ensuite
          </Typography>
          {next.map((n) => (
            <Stack key={n.day} direction="row" justifyContent="space-between" spacing={1.5} sx={{ fontSize: 13 }}>
              <Typography sx={{ fontSize: 13, color: "text.secondary", minWidth: 0 }} noWrap>
                {SHORT_FORMAT.format(new Date(year, month, n.day))} · {n.names.join(", ")}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                {euro(n.total)}
              </Typography>
            </Stack>
          ))}
        </>
      )}
    </Stack>
  );
}
