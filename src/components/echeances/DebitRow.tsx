"use client";

import { Box, Stack, Typography, Chip } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import type { CalendarContract, Occurrence } from "@/modules/contracts/calendar";
import { formatEuro } from "@/modules/contracts/calendar";
import { getFrequencyLabel } from "@/modules/contracts/categories";
import { findCategory, NO_CATEGORY, type Category } from "@/modules/categories/model";
import ContractAvatar from "@/components/contracts/ContractAvatar";

function renewsIn(contract: CalendarContract, year: number, month: number) {
  if (!contract.renewalDate) return false;
  const d = new Date(contract.renewalDate);
  return d.getFullYear() === year && d.getMonth() === month;
}

interface DebitRowProps {
  occurrence: Occurrence;
  categories: Category[];
  today: Date;
  onOpen: (contract: CalendarContract) => void;
  /** « Tout » liste des contrats, pas des occurrences : le jour n'a pas de sens. */
  hideDay?: boolean;
  /** Marque un prélèvement unique déjà passé dans la liste « Tout ». */
  markPast?: boolean;
}

// Une ligne = une échéance : la pastille et le nom à gauche, le montant à
// droite. Le jour est porté par l'intercalaire au-dessus.
export default function DebitRow({
  occurrence,
  categories,
  today,
  onOpen,
  hideDay,
  markPast,
}: DebitRowProps) {
  const { date, contract } = occurrence;
  const category = findCategory(categories, contract.category);
  const orphan = category.slug === NO_CATEGORY.slug;
  const renews = renewsIn(contract, date.getFullYear(), date.getMonth());
  const isPast =
    markPast &&
    contract.frequency === "once" &&
    contract.startDate !== null &&
    new Date(contract.startDate) < today;
  const when = hideDay
    ? getFrequencyLabel(contract.frequency).toLowerCase()
    : `${getFrequencyLabel(contract.frequency).toLowerCase()} · le ${date.getDate() === 1 ? "1er" : date.getDate()}`;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onOpen(contract)}
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.75,
        px: { xs: 1.5, sm: 2.5 },
        py: 1.5,
        border: 0,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        textAlign: "left",
        cursor: "pointer",
        font: "inherit",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <ContractAvatar contract={contract} category={category} />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          title={contract.name}
          sx={{
            fontSize: 14,
            fontWeight: 600,
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
          sx={{ mt: "2px", overflow: "hidden", whiteSpace: "nowrap" }}
        >
          <Typography
            sx={{
              fontSize: 12,
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            <span>{contract.provider}</span> · {when}
          </Typography>
          {renews && (
            <Chip
              icon={<AutorenewIcon />}
              label="renouvellement"
              size="small"
              color="warning"
              variant="outlined"
              sx={tagSx}
            />
          )}
          {isPast && (
            <Chip label="prélèvement passé" size="small" variant="outlined" sx={tagSx} />
          )}
        </Stack>
      </Box>

      <Box
        component="span"
        sx={{
          display: { xs: "none", sm: "inline-flex" },
          alignItems: "center",
          gap: 0.75,
          flex: "none",
          fontSize: 12,
          px: 1.25,
          py: 0.5,
          borderRadius: 999,
          bgcolor: orphan ? "warning.light" : "action.hover",
          color: orphan ? "warning.contrastText" : "text.primary",
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: 0.5, bgcolor: category.color }} />
        {category.label}
      </Box>

      <Typography
        sx={{
          minWidth: 84,
          textAlign: "right",
          fontSize: 15,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}
      >
        {formatEuro(contract.amount)}
      </Typography>
    </Box>
  );
}

const tagSx = {
  height: 20,
  flex: "none",
  fontSize: 11,
  "& .MuiChip-label": { px: 0.75 },
  "& .MuiChip-icon": { fontSize: 12, ml: 0.5, mr: -0.25 },
};
