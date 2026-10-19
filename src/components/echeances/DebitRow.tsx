"use client";

import { Box, Stack, Typography, Chip } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import type { CalendarContract, Occurrence } from "@/modules/contracts/calendar";
import { formatEuro } from "@/modules/contracts/calendar";
import { findCategory, NO_CATEGORY, type Category } from "@/modules/categories/model";

function renewsIn(contract: CalendarContract, year: number, month: number) {
  if (!contract.renewalDate) return false;
  const d = new Date(contract.renewalDate);
  return d.getFullYear() === year && d.getMonth() === month;
}

interface DebitRowProps {
  occurrence: Occurrence;
  categories: Category[];
  today: Date;
  onEdit: (contract: CalendarContract) => void;
  /** « Tout » liste des contrats, pas des occurrences : le jour n'a pas de sens. */
  hideDay?: boolean;
  /** Marque un prélèvement unique déjà passé dans la liste « Tout ». */
  markPast?: boolean;
}

// Une ligne = une échéance. Le jour ancre la lecture à gauche, le montant
// à droite ; tout le reste est secondaire.
export default function DebitRow({
  occurrence,
  categories,
  today,
  onEdit,
  hideDay,
  markPast,
}: DebitRowProps) {
  const { date, contract } = occurrence;
  const category = findCategory(categories, contract.category);
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const renews = renewsIn(contract, date.getFullYear(), date.getMonth());
  const isPast =
    markPast &&
    contract.frequency === "once" &&
    contract.startDate !== null &&
    new Date(contract.startDate) < today;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onEdit(contract)}
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "30px 9px minmax(0,1fr) auto", sm: "34px 11px minmax(0,1fr) auto" },
        alignItems: "center",
        gap: { xs: 1.25, sm: 1.5 },
        px: 1.25,
        py: 1.1,
        border: 0,
        borderRadius: 1.5,
        bgcolor: "transparent",
        color: "text.primary",
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
        "& + &": { boxShadow: "0 -1px 0 #1e2029" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.035)", boxShadow: "none" },
        "&:hover + &": { boxShadow: "none" },
      }}
    >
      <Typography
        sx={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          color: isToday ? "primary.main" : "text.secondary",
          fontWeight: isToday ? 500 : 400,
        }}
      >
        {hideDay ? "—" : date.getDate()}
      </Typography>

      <Box
        sx={{ width: 9, height: 9, borderRadius: "50%", bgcolor: category.color }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography
          title={contract.name}
          sx={{
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.35,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {contract.name}
        </Typography>
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.9}
          sx={{ mt: "1px", overflow: "hidden", whiteSpace: "nowrap" }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {contract.provider}
          </Typography>
          {category.slug === NO_CATEGORY.slug && (
            <Chip label="sans catégorie" size="small" variant="outlined" sx={tagSx("#5c6675")} />
          )}
          {renews && (
            <Chip
              icon={<AutorenewIcon sx={{ fontSize: 11 }} />}
              label="renouvellement"
              size="small"
              variant="outlined"
              sx={tagSx("#fbbf24")}
            />
          )}
          {isPast && (
            <Chip label="prélèvement passé" size="small" variant="outlined" sx={tagSx("#5c6675")} />
          )}
        </Stack>
      </Box>

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
    </Box>
  );
}

const tagSx = (color: string) => ({
  height: 18,
  flex: "none",
  borderColor: color,
  color,
  fontSize: 10,
  letterSpacing: "0.04em",
  textTransform: "uppercase" as const,
  "& .MuiChip-label": { px: 0.75 },
  "& .MuiChip-icon": { color, ml: 0.5, mr: -0.25 },
});
