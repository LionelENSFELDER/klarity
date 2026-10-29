import { getSession } from "@/lib/session";
import { AppBar, Box, Toolbar } from "@mui/material";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { getCategories } from "@/modules/categories/queries";
import { buildSidebarCounts, getUserInitials } from "@/modules/contracts/sidebar";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";
import Logo from "./Logo";

const Header = async () => {
  const session = await getSession();

  // Pas de session : pas de header (pages d'authentification).
  if (!session?.user?.id) {
    return null;
  }

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
        // Sur desktop le rail de gauche porte la marque, la navigation
        // et le profil : le header n'a plus de rôle.
        display: { xs: "flex", md: "none" },
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ gap: 1.5, px: 2 }}>
        <MobileNav categories={categories} counts={counts} user={session.user} />
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", justifyContent: "center" }}>
          <Logo withName />
        </Box>
        <UserMenu user={session.user} userInitials={getUserInitials(session.user?.name)} />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
