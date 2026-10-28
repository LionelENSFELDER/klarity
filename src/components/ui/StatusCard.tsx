import { Box, Stack, Typography } from "@mui/material";

interface StatusCardProps {
  icon: React.ReactNode;
  tone: "error" | "info";
  title: string;
  message: string;
  /** Boutons d'action, empilés sur mobile. */
  actions: React.ReactNode;
  footnote?: string;
}

/** Carte centrée des écrans d'erreur et de page introuvable. */
export default function StatusCard({ icon, tone, title, message, actions, footnote }: StatusCardProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        py: { xs: 6, sm: 12 },
        px: 2,
      }}
    >
      <Stack
        component="section"
        aria-labelledby="status-title"
        spacing={2.25}
        sx={{
          width: "100%",
          maxWidth: 460,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          p: { xs: 3, sm: 4 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: `rgba(var(--mui-palette-${tone}-mainChannel) / 0.12)`,
            color: `${tone}.main`,
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography id="status-title" component="h1" sx={{ fontSize: 22, fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.75 }}>{message}</Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 0.5 }}>
          {actions}
        </Stack>
        {footnote && (
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{footnote}</Typography>
        )}
      </Stack>
    </Box>
  );
}
