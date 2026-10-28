import { CircularProgress, Stack, Typography } from "@mui/material";

// Les pages sont rendues à la demande et Neon peut mettre quelques secondes à
// sortir de veille : sans indicateur, l'écran blanc se lit comme une panne.
export default function Loading() {
  return (
    <Stack
      role="status"
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{ flex: 1, py: 8, color: "text.secondary" }}
    >
      <CircularProgress size={28} color="inherit" />
      <Typography sx={{ fontSize: 14 }}>Chargement de tes contrats…</Typography>
    </Stack>
  );
}
