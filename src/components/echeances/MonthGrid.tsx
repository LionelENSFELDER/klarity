"use client";

import { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import {
  daysInMonth,
  formatEuro,
  getMonthOccurrences,
  type CalendarContract,
} from "@/modules/contracts/calendar";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface MonthGridProps {
  contracts: CalendarContract[];
  year: number;
  month: number;
  today: Date;
  /** Ouvre la popup d'édition depuis une ligne du détail du jour. */
  onSelect: (contract: CalendarContract) => void;
}

/**
 * Vue secondaire : lire la répartition des prélèvements dans le mois.
 *
 * Une case ne porte que le total du jour — c'est la seule information
 * lisible d'un coup d'œil à cette taille. Le détail vit dans la popup.
 */
export default function MonthGrid({
  contracts,
  year,
  month,
  today,
  onSelect,
}: MonthGridProps) {
  const [openDay, setOpenDay] = useState<number | null>(null);

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

  const dayContracts = openDay !== null ? (byDay.get(openDay) ?? []) : [];
  const dayTotal = dayContracts.reduce((s, c) => s + c.amount, 0);

  return (
    <Box sx={{ pt: 2 }}>
      <Typography sx={{ color: "text.secondary", fontSize: 12.5, mb: 1.75 }}>
        La grille reste disponible pour lire la répartition des prélèvements dans
        le mois. Clique sur un jour pour en voir le détail.
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
          const clickable = list.length > 0;

          return (
            <Box
              key={day}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={
                clickable
                  ? `${day} : ${formatEuro(total)}, ${list.length} prélèvement${
                      list.length > 1 ? "s" : ""
                    }`
                  : undefined
              }
              data-testid={`calendar-day-${day}`}
              onClick={() => clickable && setOpenDay(day)}
              onKeyDown={(e) => {
                if (clickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setOpenDay(day);
                }
              }}
              sx={{
                // Carrée sur mobile ; sur desktop une hauteur fixe, sinon la
                // cellule grandit avec la largeur du panneau et devient énorme.
                aspectRatio: { xs: "1 / 1", md: "auto" },
                height: { md: 86 },
                maxWidth: "100%",
                minWidth: 0,
                border: 1,
                borderColor: isToday ? "primary.main" : "#1e2029",
                boxShadow: isToday ? "inset 0 0 0 1px #8b5cf6" : "none",
                borderRadius: 1.5,
                p: { xs: 0.75, md: 1 },
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.paper",
                overflow: "hidden",
                cursor: clickable ? "pointer" : "default",
                "&:hover": clickable
                  ? {
                      borderColor: "primary.main",
                      bgcolor: "rgba(255,255,255,0.03)",
                    }
                  : undefined,
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

              {/* Seule information portée par la case : le total du jour. */}
              {total > 0 && (
                <Typography
                  sx={{
                    mt: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: { xs: 9.5, md: 11.5 },
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {formatEuro(total)}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>

      <Dialog
        open={openDay !== null}
        onClose={() => setOpenDay(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography
            component="span"
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 600,
              fontSize: 17,
              display: "block",
              textTransform: "capitalize",
            }}
          >
            {openDay !== null &&
              new Date(year, month, openDay).toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "text.secondary",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {formatEuro(dayTotal)} · {dayContracts.length} prélèvement
            {dayContracts.length > 1 ? "s" : ""}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 1 }}>
          <Stack>
            {dayContracts.map((contract, i) => (
              <Stack
                key={`${contract.id}-${i}`}
                component="button"
                type="button"
                direction="row"
                alignItems="baseline"
                spacing={1.5}
                onClick={() => {
                  // Fermer avant d'ouvrir l'édition : deux popups empilées
                  // sont pénibles à refermer.
                  setOpenDay(null);
                  onSelect(contract);
                }}
                sx={{
                  width: "100%",
                  py: 1,
                  px: 1,
                  border: 0,
                  borderRadius: 1.5,
                  bgcolor: "transparent",
                  color: "text.primary",
                  font: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                  "& + &": { boxShadow: "0 -1px 0 #1e2029" },
                  "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
                }}
              >
                <Typography
                  title={contract.name}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {contract.name}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 14,
                    fontWeight: 500,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatEuro(contract.amount)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
