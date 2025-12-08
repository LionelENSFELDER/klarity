import { Box, Container, Stack, Typography, Chip, Button } from "@mui/material";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
        py: 3,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              © 2025 Klarity. Tous droits réservés.
            </Typography>
            <Chip label="Alpha v0.1.0" size="small" variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button size="small" color="inherit">
              Confidentialité
            </Button>
            <Button size="small" color="inherit">
              Conditions
            </Button>
            <Button size="small" color="inherit">
              Support
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
