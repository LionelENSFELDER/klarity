import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  Badge,
  Stack,
  IconButton,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Description as ContractsIcon,
  CalendarMonth as CalendarIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Link from "next/link";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";

const Header = async () => {
  const session = await getServerSession(authOptions);

  // Si pas de session, ne pas afficher le header
  if (!session) {
    return null;
  }

  const userInitials: string =
    session.user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Mobile Menu */}
        <MobileNav />

        {/* Logo & Brand */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" sx={{ color: "white" }}>
              📋
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Klarity
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Gestion administrative simplifiée
            </Typography>
          </Box>
        </Stack>

        {/* Navigation Desktop */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          <Button
            component={Link}
            href="/calendar"
            startIcon={<CalendarIcon />}
            sx={{ color: "text.primary" }}
          >
            Calendrier
          </Button>
          {/* <Button
            component={Link}
            href="/contracts"
            startIcon={<ContractsIcon />}
            sx={{ color: "text.secondary" }}
          >
            Contrats
          </Button> */}
          {/* <Button
            component={Link}
            href="/dashboard"
            startIcon={<DashboardIcon />}
            sx={{ color: "text.secondary" }}
          >
            Dashboard
          </Button> */}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          {/* Add Contract Button */}
          {/* <Button
            component={Link}
            href="/contracts/new"
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            Nouveau contrat
          </Button> */}

          {/* Notifications */}
          <IconButton size="small">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Menu */}
          <UserMenu user={session.user} userInitials={userInitials} />
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
