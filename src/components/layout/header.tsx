import { getSession } from "@/lib/session";
import { AppBar, Badge, Box, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import { Notifications as NotificationsIcon } from "@mui/icons-material";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { getCategories } from "@/modules/categories/queries";
import { buildSidebarCounts } from "@/modules/contracts/sidebar";
import { ACCENT_GRADIENT } from "@/lib/theme";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";

const Header = async () => {
  const session = await getSession();

  // Pas de session : pas de header (pages d'authentification).
  if (!session) {
    return null;
  }

  const userInitials: string =
    session.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "??";

  // Les mêmes données que le rail desktop, pour que le tiroir mobile soit
  // complet. `cache` les dédoublonne avec celles demandées par la page.
  const [contracts, categories, providers] = await Promise.all([
    getCalendarContracts(),
    getCategories(),
    getProviders(),
  ]);
  const counts = buildSidebarCounts(
    contracts,
    categories,
    providers,
    3,
    new Date(),
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        // Sur desktop le rail de gauche porte la marque, la navigation,
        // les notifications et le profil : le header n'a plus de rôle.
        display: { xs: "flex", md: "none" },
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <MobileNav categories={categories} counts={counts} user={session.user} />

        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 2,
              background: ACCENT_GRADIENT,
              display: "grid",
              placeItems: "center",
              fontSize: 15,
              flex: "none",
            }}
          >
            📋
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.01em",
            }}
          >
            Klarity
          </Typography>
        </Stack>

        <Stack direction="row" spacing={0.5} alignItems="center">
          <IconButton size="small" aria-label="Notifications">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
          <UserMenu user={session.user} userInitials={userInitials} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
