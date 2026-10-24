"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Badge,
  Box,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InboxIcon from "@mui/icons-material/Inbox";
import InsightsIcon from "@mui/icons-material/Insights";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ACCENT_GRADIENT } from "@/lib/theme";
import { formatEuro } from "@/modules/contracts/calendar";
import { NO_CATEGORY, type Category } from "@/modules/categories/model";
import AddContractButton from "@/components/contracts/AddContractButton";
import UserMenu from "./UserMenu";
import {
  getUserInitials,
  type SidebarCounts,
  type SidebarUser,
} from "@/modules/contracts/sidebar";

interface NavContentProps {
  categories: Category[];
  counts: SidebarCounts;
  user: SidebarUser;
  /** Ferme le tiroir mobile après un clic ; inutile sur le rail desktop. */
  onNavigate?: () => void;
}

const LISTS = [
  { id: "a-venir", label: "À venir", icon: ScheduleIcon },
  { id: "mois", label: "Ce mois-ci", icon: CalendarMonthIcon },
  { id: "tout", label: "Tout", icon: InboxIcon },
] as const;

// Chaque entrée est un lien : l'état vit dans l'URL, donc le retour
// arrière fonctionne et une liste filtrée se partage.
function NavLink({
  href,
  current,
  children,
  onNavigate,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Box
      component={Link}
      href={href}
      aria-current={current ? "page" : undefined}
      onClick={onNavigate}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        px: 1,
        py: 0.9,
        borderRadius: 1.75,
        textDecoration: "none",
        color: current ? "#fff" : "text.primary",
        background: current ? ACCENT_GRADIENT : "transparent",
        "&:hover": {
          background: current ? ACCENT_GRADIENT : "action.hover",
        },
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Bascule clair/sombre, habillée comme une entrée du rail. `mode` reste
 * indéfini jusqu'au montage : on affiche alors l'action « Thème clair ».
 */
function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isLight = (mode === "system" ? systemMode : mode) === "light";
  const Icon = isLight ? DarkModeIcon : LightModeIcon;

  return (
    <Box
      component="button"
      type="button"
      onClick={() => setMode(isLight ? "dark" : "light")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        px: 1,
        py: 0.9,
        border: 0,
        borderRadius: 1.75,
        bgcolor: "transparent",
        cursor: "pointer",
        font: "inherit",
        textAlign: "left",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Icon sx={{ fontSize: 16, opacity: 0.85, color: "text.primary" }} />
      <Typography sx={{ ...textSx, color: "text.secondary" }}>
        {isLight ? "Thème sombre" : "Thème clair"}
      </Typography>
    </Box>
  );
}

/** Au-delà, la liste défile au lieu de pousser le reste du rail hors écran. */
const SECTION_MAX_HEIGHT = 216;

/**
 * Section repliable du rail. Le titre ouvre et ferme ; la liste est bornée
 * en hauteur et défile toute seule quand les entrées s'accumulent.
 */
function NavSection({
  title,
  settingsTab,
  children,
}: {
  title: string;
  settingsTab?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ mt: 2.25 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pr: 0.5, pb: 0.9 }}
      >
        <Stack
          component="button"
          type="button"
          direction="row"
          alignItems="center"
          spacing={0.25}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          sx={{
            flex: 1,
            minWidth: 0,
            px: 1,
            py: 0.25,
            border: 0,
            bgcolor: "transparent",
            cursor: "pointer",
            borderRadius: 1,
            color: "#5c6675",
            font: "inherit",
            textAlign: "left",
            "&:hover": { color: "text.secondary" },
          }}
        >
          <ExpandMoreIcon
            sx={{
              fontSize: 15,
              transition: "transform 150ms",
              transform: open ? "none" : "rotate(-90deg)",
            }}
          />
          <Typography
            component="span"
            sx={{
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              color: "inherit",
            }}
          >
            {title}
          </Typography>
        </Stack>
        {settingsTab && (
          <Tooltip title="Gérer">
            <IconButton
              component={Link}
              href={`/reglages?onglet=${settingsTab}`}
              size="small"
              sx={{ color: "#5c6675", p: 0.3 }}
            >
              <SettingsIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box
          sx={{
            maxHeight: SECTION_MAX_HEIGHT,
            overflowY: "auto",
            // Laisse respirer la barre de défilement quand elle apparaît.
            pr: 0.25,
          }}
        >
          <Stack spacing={0.25}>{children}</Stack>
        </Box>
      </Collapse>
    </Box>
  );
}

const textSx = {
  flex: 1,
  minWidth: 0,
  fontSize: 13.5,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const countSx = {
  fontFamily: "var(--font-mono)",
  fontSize: 11.5,
  color: "#5c6675",
  fontVariantNumeric: "tabular-nums",
} as const;

/**
 * Contenu de navigation, identique sur le rail desktop et dans le tiroir
 * mobile — une seule source de vérité pour les deux.
 */
export default function NavContent({
  categories,
  counts,
  user,
  onNavigate,
}: NavContentProps) {
  // L'entrée courante se lit dans l'URL : pas de prop à faire descendre.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onSettings = pathname.startsWith("/reglages");
  const onDashboard = pathname.startsWith("/tableau-de-bord");
  const active = {
    liste: searchParams.get("liste") ?? "a-venir",
    categorie: searchParams.get("categorie"),
    fournisseur: searchParams.get("fournisseur"),
  };
  const noFilter = !active.categorie && !active.fournisseur;
  // Une catégorie sans contrat reste dans les réglages mais disparaît d'ici.
  const shown = categories.filter((c) => (counts.byCategory[c.slug] ?? 0) > 0);
  const isList = (id: string) =>
    !onSettings && !onDashboard && noFilter && active.liste === id;

  return (
    <>
    {/* Marque : portée par le rail sur desktop, par le tiroir sur mobile */}
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.25}
      sx={{ px: 2.25, pt: 2, pb: 1.5 }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 2,
          background: ACCENT_GRADIENT,
          display: "grid",
          placeItems: "center",
          fontSize: 15,
        }}
      >
        📋
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: "-0.01em",
        }}
      >
        Klarity
      </Typography>
    </Stack>

    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.25, pb: 1.5 }}>
      <Stack spacing={0.25}>
        <NavLink
          onNavigate={onNavigate}
          href="/tableau-de-bord"
          current={onDashboard}
        >
          <InsightsIcon sx={{ fontSize: 16, opacity: 0.85 }} />
          <Typography sx={textSx}>Tableau de bord</Typography>
        </NavLink>
        {LISTS.map((l) => {
          const Icon = l.icon;
          const current = isList(l.id);
          const count =
            l.id === "a-venir"
              ? counts.aVenir
              : l.id === "mois"
                ? counts.mois
                : counts.tout;
          return (
            <NavLink onNavigate={onNavigate} key={l.id} href={`/calendar?liste=${l.id}`} current={current}>
              <Icon sx={{ fontSize: 16, opacity: 0.85 }} />
              <Typography sx={textSx}>{l.label}</Typography>
              <Typography
                sx={{ ...countSx, color: current ? "rgba(255,255,255,0.85)" : "#5c6675" }}
              >
                {count}
              </Typography>
            </NavLink>
          );
        })}
      </Stack>

      <NavSection title="Catégories" settingsTab="categories">
          {shown.map((cat) => {
            const current = !onSettings && active.categorie === cat.slug;
            return (
              <NavLink onNavigate={onNavigate}
                key={cat.slug}
                href={`/calendar?categorie=${encodeURIComponent(cat.slug)}`}
                current={current}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    bgcolor: cat.color,
                    flex: "none",
                    mx: 0.4,
                  }}
                />
                <Typography sx={textSx} title={cat.label}>
                  {cat.label}
                </Typography>
                <Typography
                  sx={{ ...countSx, color: current ? "rgba(255,255,255,0.85)" : "#5c6675" }}
                >
                  {counts.byCategory[cat.slug]}
                </Typography>
              </NavLink>
            );
          })}

          {counts.orphans > 0 && (
            <NavLink onNavigate={onNavigate}
              href={`/calendar?categorie=${NO_CATEGORY.slug}`}
              current={!onSettings && active.categorie === NO_CATEGORY.slug}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  bgcolor: NO_CATEGORY.color,
                  flex: "none",
                  mx: 0.4,
                }}
              />
              <Typography sx={textSx}>{NO_CATEGORY.label}</Typography>
              <Typography sx={countSx}>{counts.orphans}</Typography>
            </NavLink>
          )}

        {shown.length === 0 && counts.orphans === 0 && (
          <Typography sx={{ px: 1, fontSize: 12, color: "#5c6675" }}>
            Aucune catégorie utilisée
          </Typography>
        )}
      </NavSection>

      <NavSection title="Fournisseurs" settingsTab="fournisseurs">
          {counts.providers.map((p) => {
            const current = !onSettings && active.fournisseur === p.name;
            return (
              <NavLink onNavigate={onNavigate}
                key={p.name}
                href={`/calendar?fournisseur=${encodeURIComponent(p.name)}`}
                current={current}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    border: "1px solid #5c6675",
                    flex: "none",
                    mx: 0.4,
                  }}
                />
                <Typography sx={textSx} title={p.name}>
                  {p.name}
                </Typography>
                <Typography
                  sx={{ ...countSx, color: current ? "rgba(255,255,255,0.85)" : "#5c6675" }}
                >
                  {formatEuro(Math.round(p.monthlyCost))}
                </Typography>
              </NavLink>
          );
        })}
      </NavSection>
    </Box>

    <Stack spacing={0.9} sx={{ p: 1.25, borderTop: 1, borderColor: "divider" }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.5 }}>
        <UserMenu user={user} userInitials={getUserInitials(user.name)} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            title={user.name ?? undefined}
            sx={{
              fontSize: 13,
              fontWeight: 500,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.name ?? "Utilisateur"}
          </Typography>
          <Typography
            title={user.email ?? undefined}
            sx={{
              fontSize: 11.5,
              color: "#5c6675",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </Typography>
        </Box>
        <Tooltip title="Notifications">
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      </Stack>

      <NavLink onNavigate={onNavigate} href="/reglages" current={onSettings}>
        <SettingsIcon sx={{ fontSize: 16, opacity: 0.85 }} />
        <Typography sx={{ ...textSx, color: "text.secondary" }}>Réglages</Typography>
      </NavLink>
      <ThemeToggle />
      <AddContractButton
        variant="contained"
        fullWidth
        sx={{
          background: ACCENT_GRADIENT,
          borderRadius: 2,
          py: 1,
          fontWeight: 600,
          fontSize: 13.5,
          boxShadow: "0 4px 14px rgba(139,92,246,0.28)",
        }}
      >
        ＋ Nouveau contrat
      </AddContractButton>
    </Stack>
  </>
  );
}
