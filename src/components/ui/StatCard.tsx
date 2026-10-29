import { Stack, Typography } from "@mui/material";
import { cardSx } from "./surface";

/** Carte d'indicateur : un libellé, un chiffre, une précision. */
export default function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Stack
      spacing={{ xs: 0.75, sm: 1.25 }}
      sx={{
        minWidth: 0,
        ...cardSx,
        borderRadius: { xs: 1.5, sm: 2 },
        px: { xs: 2, sm: 2.75 },
        py: { xs: 1.75, sm: 2.5 },
      }}
    >
      <Typography sx={{ fontSize: { xs: 13, sm: 14 }, color: "text.secondary" }}>
        {label}
      </Typography>
      {/* Le chiffre d'abord, en grand corps fin. */}
      <Typography sx={{ fontSize: { xs: 26, sm: 38 }, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1, whiteSpace: "nowrap" }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, color: "text.secondary" }}>{note}</Typography>
    </Stack>
  );
}

/**
 * Grille d'indicateurs : 4 colonnes sur grand écran, 2×2 sur mobile pour que
 * les échéances restent visibles sans défiler.
 */
export const statGridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(auto-fit, minmax(210px, 1fr))" },
  gap: { xs: 1.25, sm: 2 },
} as const;
