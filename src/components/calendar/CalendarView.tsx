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
  TextField,
  InputAdornment,
  Divider,
  Chip,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Link from "next/link";
import {
  type CalendarContract,
  getMonthDebits,
  getMonthTotal,
  formatEuro,
} from "@/modules/contracts/calendar";
import { CATEGORIES, getCategory, getFrequencyLabel } from "@/modules/contracts/categories";
import { statsType } from "@modules/contracts/types";
import ContractInlineIcon from "@components/icons/ContratInlineIcon";

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

// Couleur de la barre indicatrice en fonction du type
const getStatusColor = (frequency: string): string => {
  switch (frequency) {
    case "once":
      return "#ef4444";
    case "monthly":
      return "#3b82f6";
    case "quarterly":
      return "#f59e0b";
    case "annual":
      return "#10b981";
    default:
      return "#8b5cf6";
  }
};

// Formatage de l'heure
const formatTimeFromDay = (day: number): string => {
  const hour = Math.min(day, 23);
  return `${hour.toString().padStart(2, "0")}:00`;
};

// Composant pour afficher une carte de contrat dans la sidebar
function ContractDetailCard({ contract }: { contract: CalendarContract }) {
  const category = getCategory(contract.category);
  const statusColor = getStatusColor(contract.frequency);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2,
        borderColor: "divider",
        bgcolor: "rgba(255,255,255,0.02)",
        transition: "all 0.2s ease",
        '&:hover': {
          borderColor: statusColor,
          boxShadow: `0 0 0 2px ${statusColor}33`,
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: 4,
          borderRadius: "4px 4px 0 0",
          bgcolor: statusColor,
          marginTop: "-1px",
          marginLeft: "-1px",
          marginRight: "-1px",
          boxShadow: `0 0 8px ${statusColor}66`,
        }}
      />

      <Stack spacing={1.5} sx={{ mt: 0.5 }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ mb: 0.5 }}
        >
          <Chip
            label={getFrequencyLabel(contract.frequency)}
            size="small"
            sx={{
              bgcolor: `${statusColor}22`,
              color: statusColor,
              borderRadius: 1,
              fontSize: "0.7rem",
              height: 20,
            }}
          />
          <Box
            sx={{
              ml: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              color: "text.secondary",
            }}
          >
            {formatTimeFromDay(contract.debitDay)}
          </Box>
        </Stack>

        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, mb: 0.25 }}
          >
            {contract.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {contract.provider}
          </Typography>
        </Box>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: category.color,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {category.label}
            </Typography>
          </Stack>
          <Typography
            variant="subtitle2"
            sx={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              color: statusColor,
            }}
          >
            {formatEuro(contract.amount)}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            pt: 1,
          }}
        >
          <ContractInlineIcon
            iconType={contract.iconType}
            iconValue={contract.iconValue}
            name={contract.name}
          />
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />
        <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            Prélèvement: le {contract.debitDay}
          </Typography>
          {contract.renewalDate && (
            <Typography variant="caption" color="text.secondary">
              | Renouvellement: {new Date(contract.renewalDate).toLocaleDateString("fr-FR")}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

// Composant pour la sidebar de détail
function DayDetailSidebar({
  date,
  debit,
}: {
  date: Date | null;
  debit: { day: number; contracts: CalendarContract[]; total: number } | null;
}) {
  if (!date || !debit) {
    return (
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          height: "100%",
          bgcolor: "background.paper",
          borderColor: "divider",
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "text.secondary",
          borderRadius: 2,
          borderLeft: { md: 1, xs: 0 },
        }}
      >
        <Stack spacing={2} textAlign="center">
          <Typography variant="h6" color="text.primary">
            Sélectionnez un jour
          </Typography>
          <Typography variant="body2">
            Cliquez sur un jour du calendrier pour voir les détails
          </Typography>
        </Stack>
      </Paper>
    );
  }

  const formattedDate = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Paper
      variant="outlined"
      sx={{
        width: "100%",
        height: "100%",
        bgcolor: "background.paper",
        borderColor: "divider",
        p: 2,
        overflowY: "auto",
        borderRadius: 2,
        borderLeft: { md: 1, xs: 0 },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, textTransform: "capitalize" }}>
          Contrats du jour
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: "var(--font-mono)",
            color: "text.secondary",
            textTransform: "capitalize",
          }}
        >
          {formattedDate}
        </Typography>
      </Stack>

      <Box
        sx={{
          mb: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: "rgba(139, 92, 246, 0.1)",
          border: "1px solid",
          borderColor: "rgba(139, 92, 246, 0.3)",
        }}
      >
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            Total du jour
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#a78bfa",
            }}
          >
            {formatEuro(debit.total)}
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={2}>
        {debit.contracts.length > 0 ? (
          debit.contracts.map((contract) => (
            <ContractDetailCard key={contract.id} contract={contract} />
          ))
        ) : (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            <Typography variant="body2">Aucun prélèvement ce jour</Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}

export default function CalendarView({
  contracts,
  stats,
}: {
  contracts: CalendarContract[];
  stats: statsType;
}) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const debitsByDay = useMemo(
    () => getMonthDebits(contracts, year, month),
    [contracts, year, month]
  );
  const monthTotal = useMemo(
    () => getMonthTotal(contracts, year, month),
    [contracts, year, month]
  );

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

  const firstDay = new Date(year, month, 1);
  const daysCount = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const cells: (number | null)[] = [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysCount }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth();

  const selectedDebit =
    selectedDay !== null ? (debitsByDay.get(selectedDay) ?? null) : null;

  const selectedDate = selectedDay !== null ? new Date(year, month, selectedDay) : null;

  const filteredContracts = searchQuery
    ? contracts.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.provider.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contracts;

  const filteredDebitsByDay = useMemo(
    () => getMonthDebits(filteredContracts, year, month),
    [filteredContracts, year, month]
  );

  const hasContractsToday = isCurrentMonth && debitsByDay.has(today.getDate());

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 2, position: "relative", overflow: "hidden" }}>
      {/* Fond avec léger dégradé pour la profondeur */}
      <Box sx={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />
      <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 }, position: "relative", zIndex: 1 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              }}
            >
              <Typography variant="h5" sx={{ color: "white", fontWeight: 700 }}>
                📋
              </Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Bonjour !
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                Voici vos contrats pour le mois de {MONTHS[month]} {year}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", md: "auto" },
              maxWidth: { xs: "100%", md: 400 },
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher un contrat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: "rgba(255,255,255,0.04)",
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  borderColor: "divider",
                  transition: "all 0.2s ease",
                },
                '&:hover .MuiOutlinedInput-root': {
                  borderColor: "rgba(255,255,255,0.2)",
                },
                '& .MuiOutlinedInput-root.Mui-focused': {
                  borderColor: "primary.main",
                  boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)",
                },
              }}
            />
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <NotificationsIcon />
            </IconButton>
            <IconButton size="small" sx={{ color: "text.secondary" }}>
              <SettingsIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 3, flexWrap: "wrap", gap: 1 }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              flex: 1,
              minWidth: 180,
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,0.02)",
              transition: "transform 0.2s ease",
              '&:hover': {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Contrats actifs
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {stats.activeContracts} / {stats.totalContracts}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              flex: 1,
              minWidth: 180,
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,0.02)",
              transition: "transform 0.2s ease",
              '&:hover': {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Total annuel
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {formatEuro(stats.totalAnnual || 0)}
            </Typography>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              flex: 1,
              minWidth: 180,
              borderColor: hasContractsToday ? "#10b981" : "divider",
              bgcolor: hasContractsToday ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.02)",
              transition: "transform 0.2s ease",
              '&:hover': {
                transform: "translateY(-2px)",
                boxShadow: hasContractsToday ? "0 4px 12px rgba(16, 185, 129, 0.2)" : "0 4px 12px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {MONTHS[month]} {year}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                background: "linear-gradient(135deg, #a78bfa, #60a5fa)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              {formatEuro(monthTotal)}
            </Typography>
          </Paper>
        </Stack>

        {activeCategories.length > 0 && (
          <Stack
            direction="row"
            spacing={2}
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 2 }}
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

        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Stack direction="row" spacing={0.5}>
            <IconButton onClick={goToPreviousMonth} aria-label="Mois précédent">
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={goToNextMonth} aria-label="Mois suivant">
              <ChevronRightIcon />
            </IconButton>
          </Stack>

          <Button
            component={Link}
            href="/contracts/new"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1.25,
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              '&:hover': {
                boxShadow: "0 6px 16px rgba(139, 92, 246, 0.4)",
              },
            }}
          >
            Ajouter un contrat
          </Button>
        </Stack>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            minHeight: { md: "calc(100vh - 400px)" },
          }}
        >
          <Box sx={{ flex: 1, minHeight: { md: "calc(100vh - 400px)" } }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 1, sm: 2 },
                borderRadius: 2,
                bgcolor: "background.paper",
                borderColor: "divider",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                height: "100%",
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
                  const debit = searchQuery ? filteredDebitsByDay.get(day) : debitsByDay.get(day);
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
                          borderRadius: 1.5,
                          cursor: "pointer",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: 0.25,
                          bgcolor: "transparent",
                          border: "1px solid",
                          borderColor: isSelected
                            ? "primary.main"
                            : isToday
                            ? "rgba(255,255,255,0.4)"
                            : "transparent",
                          outline: "none",
                          transition: "all 120ms ease",
                          '&:hover': {
                            bgcolor: "rgba(255,255,255,0.04)",
                            borderColor: isSelected
                              ? "primary.main"
                              : "rgba(255,255,255,0.2)",
                          },
                          '&:focus-visible': {
                            borderColor: "primary.main",
                          },
                          p: 0.5,
                          overflow: "hidden",
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

                        {debit && (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            justifyContent="center"
                            sx={{ maxWidth: "80%", mt: 1 }}
                          >
                            {debit.contracts.slice(0, 4).map((c) => {
                              return (
                                <Box
                                  key={c.id}
                                  sx={{
                                    width: { xs: 18, sm: 22 },
                                    height: { xs: 18, sm: 22 },
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "10px",
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  <ContractInlineIcon
                                    iconType={c.iconType}
                                    iconValue={c.iconValue}
                                    name={c.name}
                                  />
                                </Box>
                              );
                            })}

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
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: 360 },
              display: { xs: selectedDay !== null ? "block" : "none", md: "block" },
              minHeight: { md: "calc(100vh - 400px)" },
            }}
          >
            <DayDetailSidebar date={selectedDate} debit={selectedDebit} />
          </Box>
        </Box>

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
            borderRadius: 2,
          }}
        >
          Ajouter
        </Button>
      </Container>
    </Box>
  );
}

