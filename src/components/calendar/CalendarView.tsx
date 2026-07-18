"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  Paper,
  Button,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
  type CalendarContract,
  getMonthDebits,
  getMonthTotal,
  formatEuro,
} from "@/modules/contracts/calendar";
import { CATEGORIES, getCategory } from "@/modules/contracts/categories";
import DayDetailPanel from "./DayDetailPanel";

const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function CalendarView({
  contracts,
}: {
  contracts: CalendarContract[];
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const debitsByDay = useMemo(
    () => getMonthDebits(contracts, year, month),
    [contracts, year, month],
  );
  const monthTotal = useMemo(
    () => getMonthTotal(contracts, month),
    [contracts, month],
  );

  // Catégories présentes ce mois-ci (pour la légende)
  const activeCategories = useMemo(() => {
    const ids = new Set<string>();
    debitsByDay.forEach((d) => d.contracts.forEach((c) => ids.add(c.category)));
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [debitsByDay]);

  const goToPreviousMonth = () => {
    setSelectedDay(null);
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    setSelectedDay(null);
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // Construction de la grille (semaine lundi → dimanche)
  const firstDay = new Date(year, month, 1);
  const daysCount = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7; // 0 = lundi
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const selectedDebit =
    selectedDay !== null ? (debitsByDay.get(selectedDay) ?? null) : null;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
      <Container maxWidth="md">
        {/* En-tête : mois + navigation */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" alignItems="baseline" spacing={1.5}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {MONTHS[month]} {year}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "var(--font-mono)",
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {formatEuro(monthTotal)}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <IconButton onClick={goToPreviousMonth} aria-label="Mois précédent">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={goToNextMonth} aria-label="Mois suivant">
              <ChevronRightIcon />
            </IconButton>
            <Button
              component={Link}
              href="/contracts/new"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ ml: 1, display: { xs: "none", sm: "inline-flex" } }}
            >
              Ajouter
            </Button>
          </Stack>
        </Stack>

        {/* Légende des catégories du mois */}
        {activeCategories.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 3 }}
          >
            {activeCategories.map((cat) => (
              <Stack
                key={cat.id}
                direction="row"
                spacing={0.75}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: cat.color,
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {cat.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        {/* Grille calendrier */}
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1, sm: 2 },
            borderRadius: 4,
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: { xs: 0.5, sm: 1 },
            }}
          >
            {WEEKDAYS.map((d) => (
              <Typography
                key={d}
                variant="caption"
                align="center"
                sx={{
                  color: "text.secondary",
                  py: 0.5,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {d}
              </Typography>
            ))}

            {cells.map((day, index) => {
              if (day === null) {
                return <Box key={`blank-${index}`} />;
              }
              const debit = debitsByDay.get(day);
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = selectedDay === day;

              return (
                <Tooltip
                  key={day}
                  title={debit ? formatEuro(debit.total) : ""}
                  disableHoverListener={!debit}
                >
                  <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDay(day)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedDay(day);
                      }
                    }}
                    sx={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      borderRadius: 2.5,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.25,
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid",
                      borderColor: isSelected
                        ? "primary.main"
                        : isToday
                          ? "rgba(255,255,255,0.4)"
                          : "transparent",
                      outline: "none",
                      transition: "background-color 120ms, border-color 120ms",
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.08)",
                      },
                      "&:focus-visible": {
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 7,
                        fontFamily: "var(--font-display)",
                        color: isToday ? "text.primary" : "text.secondary",
                        fontWeight: isToday ? 700 : 400,
                      }}
                    >
                      {day}
                    </Typography>

                    {/* Pastilles */}
                    {debit && (
                      <Stack
                        direction="row"
                        spacing={0.5}
                        flexWrap="wrap"
                        justifyContent="center"
                        sx={{ maxWidth: "80%", mt: 1 }}
                      >
                        {debit.contracts.slice(0, 4).map((c) => (
                          <Box
                            key={c.id}
                            sx={{
                              width: { xs: 8, sm: 10 },
                              height: { xs: 8, sm: 10 },
                              borderRadius: "50%",
                              bgcolor: getCategory(c.category).color,
                            }}
                          />
                        ))}
                        {debit.contracts.length > 4 && (
                          <Typography
                            variant="caption"
                            sx={{ fontSize: 9, color: "text.secondary" }}
                          >
                            +{debit.contracts.length - 4}
                          </Typography>
                        )}
                      </Stack>
                    )}

                    {/* Total du jour */}
                    {debit && (
                      <Typography
                        sx={{
                          fontFamily: "var(--font-mono)",
                          fontSize: { xs: 9, sm: 11 },
                          color: "text.secondary",
                          display: { xs: "none", sm: "block" },
                        }}
                      >
                        {formatEuro(debit.total)}
                      </Typography>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Paper>

        {/* Bouton flottant mobile */}
        <Button
          component={Link}
          href="/contracts/new"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            display: { xs: "inline-flex", sm: "none" },
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 10,
          }}
        >
          Ajouter
        </Button>
      </Container>

      {/* Panneau détail du jour */}
      <DayDetailPanel
        open={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        date={selectedDay !== null ? new Date(year, month, selectedDay) : null}
        debit={selectedDebit}
      />
    </Box>
  );
}
