"use client";

import { Box, Typography, Tooltip } from "@mui/material";
import {
  daysInMonth,
  formatEuro,
  getMonthOccurrences,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import { findCategory, type Category } from "@/modules/categories/model";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

/** Nombre de pastilles affichées avant le « +n » : une case a une hauteur bornée. */
const MAX_DOTS = 4;

interface MonthGridProps {
  contracts: CalendarContract[];
  categories: Category[];
  year: number;
  month: number;
  today: Date;
  onSelect: (contract: CalendarContract) => void;
}

// Vue secondaire : lire la répartition des prélèvements dans le mois.
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

  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(leading).fill(null),
    ...Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  return (
    <Box sx={{ pt: 2 }}>
      <Typography sx={{ color: "text.secondary", fontSize: 12.5, mb: 1.75 }}>
        La grille reste disponible pour lire la répartition des prélèvements dans
        le mois.
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 0.75,
        }}
      >
        {WEEKDAYS.map((d) => (
          <Typography
            key={d}
            sx={{
              fontSize: 10.5,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#5c6675",
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
          const total = list.reduce((s, c) => s + c.amount, 0);
          const isToday = isCurrentMonth && day === today.getDate();

          return (
            <Tooltip
              key={day}
              title={total ? formatEuro(total) : ""}
              disableHoverListener={!total}
            >
              <Box
                role={list.length ? "button" : undefined}
                tabIndex={list.length ? 0 : undefined}
                data-testid={`calendar-day-${day}`}
                onClick={() => list[0] && onSelect(list[0])}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && list[0]) {
                    e.preventDefault();
                    onSelect(list[0]);
                  }
                }}
                sx={{
                  aspectRatio: "1 / 1",
                  maxWidth: "100%",
                  border: 1,
                  borderColor: isToday ? "primary.main" : "#1e2029",
                  boxShadow: isToday ? "inset 0 0 0 1px #8b5cf6" : "none",
                  borderRadius: 1.5,
                  p: 0.75,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                  bgcolor: "background.paper",
                  overflow: "hidden",
                  cursor: list.length ? "pointer" : "default",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontVariantNumeric: "tabular-nums",
                    color: isToday ? "#fff" : "text.secondary",
                  }}
                >
                  {day}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                  {list.slice(0, MAX_DOTS).map((c, j) => (
                    <Box
                      key={`${c.id}-${j}`}
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        bgcolor: findCategory(categories, c.category).color,
                      }}
                    />
                  ))}
                  {list.length > MAX_DOTS && (
                    <Typography
                      sx={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#5c6675" }}
                    >
                      +{list.length - MAX_DOTS}
                    </Typography>
                  )}
                </Box>
                {total > 0 && (
                  <Typography
                    sx={{
                      mt: "auto",
                      fontFamily: "var(--font-mono)",
                      fontSize: 9.5,
                      color: "#5c6675",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatEuro(Math.round(total))}
                  </Typography>
                )}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
