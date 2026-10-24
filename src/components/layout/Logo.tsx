import { Box, Stack, Typography } from "@mui/material";

/** Logo : un « K » blanc sur l'accent, suivi du nom si `withName`. */
export default function Logo({ withName = false }: { withName?: boolean }) {
  const mark = (
    <Box
      aria-hidden
      sx={{
        width: 32,
        height: 32,
        borderRadius: 2.5,
        bgcolor: "primary.dark",
        display: "grid",
        placeItems: "center",
        flex: "none",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4v16" />
        <path d="M18 4 9.5 12 18 20" />
      </svg>
    </Box>
  );

  if (!withName) return mark;
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      {mark}
      <Typography sx={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.02em" }}>
        Klarity
      </Typography>
    </Stack>
  );
}
