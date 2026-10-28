import { Stack, Typography } from "@mui/material";

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
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 4,
        px: { xs: 1.75, sm: 2.5 },
        py: { xs: 1.5, sm: 2.25 },
      }}
    >
      <Typography sx={{ fontSize: { xs: 12, sm: 13 }, fontWeight: 500, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: { xs: 20, sm: 26 }, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{note}</Typography>
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
