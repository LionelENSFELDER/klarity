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
      spacing={1.25}
      sx={{
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: 4,
        px: 2.5,
        py: 2.25,
      }}
    >
      <Typography sx={{ fontSize: 13, fontWeight: 500, color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{note}</Typography>
    </Stack>
  );
}

/** Grille d'indicateurs qui passe de 4 colonnes à 1 selon la largeur. */
export const statGridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
  gap: 2,
} as const;
