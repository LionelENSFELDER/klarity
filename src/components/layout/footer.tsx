import Link from "next/link";
import { Box, Container, Stack, Typography, Chip, Button } from "@mui/material";

const LINKS = [
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Conditions", href: "/conditions" },
  { label: "Support", href: "/support" },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        py: 0.75,
        // La coquille ne défile pas : le footer est simplement le dernier
        // enfant, jamais comprimé.
        flex: "none",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          rowGap={0.25}
          columnGap={2}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              © 2025 Klarity
            </Typography>
            <Chip
              label="Alpha v2"
              size="small"
              variant="outlined"
              sx={{
                height: 18,
                fontSize: 10.5,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          </Stack>
          <Stack direction="row" spacing={0.25}>
            {LINKS.map((l) => (
              <Button
                key={l.href}
                component={Link}
                href={l.href}
                size="small"
                sx={{
                  fontSize: 12,
                  py: 0.25,
                  px: 1,
                  minWidth: 0,
                  textTransform: "none",
                  color: "text.secondary",
                }}
              >
                {l.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
