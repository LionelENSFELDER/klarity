"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  Collapse,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";
import TuneIcon from "@mui/icons-material/Tune";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InboxIcon from "@mui/icons-material/Inbox";
import InsightsIcon from "@mui/icons-material/Insights";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddIcon from "@mui/icons-material/Add";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { formatEuro } from "@/modules/contracts/calendar";
import { NO_CATEGORY, type Category } from "@/modules/categories/model";
import AddContractButton from "@/components/contracts/AddContractButton";
import UserMenu from "./UserMenu";
import Logo from "./Logo";
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

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

// Entrée active : fond teinté de l'accent. Sur fond sombre le texte prend
// la variante claire, l'accent plein n'y est pas assez contrasté.
const currentSx = {
  bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.4)",
  color: "primary.dark",
  "&:hover": { bgcolor: "rgba(var(--mui-palette-primary-mainChannel) / 0.5)" },
  ".dark &": { color: "primary.light" },
} as const;

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
        gap: 1.25,
        px: 1.25,
        minHeight: 38,
        borderRadius: 1,
        textDecoration: "none",
        color: "text.primary",
        fontWeight: 500,
        "&:hover": { bgcolor: "action.hover" },
        ...(current ? currentSx : {}),
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Bascule clair/sombre. `mode` reste indéfini jusqu'au montage : on affiche
 * alors l'action « Thème clair ».
 */
function ThemeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const isLight = (mode === "system" ? systemMode : mode) === "light";
  const Icon = isLight ? DarkModeIcon : LightModeIcon;
  const label = isLight ? "Thème sombre" : "Thème clair";

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={() => setMode(isLight ? "dark" : "light")}
        sx={{ border: 1, borderColor: "divider", borderRadius: 1, width: 36, height: 36 }}
      >
        <Icon sx={{ fontSize: 17 }} />
      </IconButton>
    </Tooltip>
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
    <Box sx={{ mt: 2.5 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pr: 0.5, pb: 0.75 }}
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
            color: "text.secondary",
            font: "inherit",
            textAlign: "left",
            "&:hover": { color: "text.primary" },
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
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: "0.06em",
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
              aria-label={`Gérer les ${title.toLowerCase()}`}
              sx={{ color: "text.secondary", p: 0.3 }}
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

/** Où en est le mois : déjà prélevé, total, reste. */
function MonthCard({ total, paid }: { total: number; paid: number }) {
  const today = new Date();
  const last = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  return (
    <Stack
      spacing={1.1}
      sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.75, bgcolor: "background.default" }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {MONTHS[today.getMonth()]}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {today.getDate()} / {last} j
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        <Box component="strong" sx={{ fontSize: 18, color: "text.primary" }}>
          {formatEuro(paid)}
        </Box>{" "}
        sur {formatEuro(total)}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={total > 0 ? (paid / total) * 100 : 0}
        aria-label="Part du mois déjà prélevée"
        sx={{ height: 6, borderRadius: 999, bgcolor: "divider" }}
      />
      <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
        Encore {formatEuro(total - paid)} d&apos;ici le {last}
      </Typography>
    </Stack>
  );
}

const textSx = {
  flex: 1,
  minWidth: 0,
  fontSize: 14,
  fontWeight: "inherit",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;

const countSx = {
  fontSize: 12,
  color: "text.secondary",
  fontVariantNumeric: "tabular-nums",
} as const;

const dotSx = { width: 10, height: 10, borderRadius: 0.75, flex: "none" } as const;

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
  const onSupport = pathname.startsWith("/support");
  const active = {
    liste: searchParams.get("liste") ?? "a-venir",
    categorie: searchParams.get("categorie"),
    fournisseur: searchParams.get("fournisseur"),
  };
  const noFilter = !active.categorie && !active.fournisseur;
  // Une catégorie sans contrat reste dans les réglages mais disparaît d'ici.
  const shown = categories.filter((c) => (counts.byCategory[c.slug] ?? 0) > 0);
  const isList = (id: string) =>
    pathname.startsWith("/calendar") && noFilter && active.liste === id;

  return (
    <>
    {/* Marque et création : portées par le rail sur desktop, par le tiroir sur mobile */}
    <Stack spacing={2} sx={{ px: 2, pt: 2.5, pb: 1.5 }}>
      <Box sx={{ px: 0.5 }}>
        <Logo withName />
      </Box>
      <AddContractButton
        variant="contained"
        fullWidth
        startIcon={<AddIcon />}
        sx={{ borderRadius: 1, minHeight: 44, fontSize: 14 }}
      >
        Nouveau contrat
      </AddContractButton>
    </Stack>

    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.5, pb: 1.5 }}>
      <Stack spacing={0.25}>
        <NavLink
          onNavigate={onNavigate}
          href="/tableau-de-bord"
          current={onDashboard}
        >
          <InsightsIcon sx={{ fontSize: 18 }} />
          <Typography sx={textSx}>Tableau de bord</Typography>
        </NavLink>
        {LISTS.map((l) => {
          const Icon = l.icon;
          const count =
            l.id === "a-venir"
              ? counts.aVenir
              : l.id === "mois"
                ? counts.mois
                : counts.tout;
          return (
            <NavLink onNavigate={onNavigate} key={l.id} href={`/calendar?liste=${l.id}`} current={isList(l.id)}>
              <Icon sx={{ fontSize: 18 }} />
              <Typography sx={textSx}>{l.label}</Typography>
              <Typography sx={countSx}>{count}</Typography>
            </NavLink>
          );
        })}
      </Stack>

      <NavSection title="Catégories" settingsTab="categories">
          {shown.map((cat) => (
            <NavLink onNavigate={onNavigate}
              key={cat.slug}
              href={`/calendar?categorie=${encodeURIComponent(cat.slug)}`}
              current={!onSettings && active.categorie === cat.slug}
            >
              <Box sx={{ ...dotSx, bgcolor: cat.color }} />
              <Typography sx={textSx} title={cat.label}>
                {cat.label}
              </Typography>
              <Typography sx={countSx}>{counts.byCategory[cat.slug]}</Typography>
            </NavLink>
          ))}

          {counts.orphans > 0 && (
            <NavLink onNavigate={onNavigate}
              href={`/calendar?categorie=${NO_CATEGORY.slug}`}
              current={!onSettings && active.categorie === NO_CATEGORY.slug}
            >
              <Box sx={{ ...dotSx, bgcolor: NO_CATEGORY.color }} />
              <Typography sx={textSx}>{NO_CATEGORY.label}</Typography>
              <Typography sx={countSx}>{counts.orphans}</Typography>
            </NavLink>
          )}

        {shown.length === 0 && counts.orphans === 0 && (
          <Typography sx={{ px: 1, fontSize: 12, color: "text.secondary" }}>
            Aucune catégorie utilisée
          </Typography>
        )}
      </NavSection>

      <NavSection title="Fournisseurs" settingsTab="fournisseurs">
          {counts.providers.map((p) => (
            <NavLink onNavigate={onNavigate}
              key={p.name}
              href={`/calendar?fournisseur=${encodeURIComponent(p.name)}`}
              current={!onSettings && active.fournisseur === p.name}
            >
              <Box sx={{ ...dotSx, border: 1, borderColor: "text.secondary" }} />
              <Typography sx={textSx} title={p.name}>
                {p.name}
              </Typography>
              <Typography sx={countSx}>
                {formatEuro(Math.round(p.monthlyCost))}
              </Typography>
            </NavLink>
          ))}
      </NavSection>
    </Box>

    <Stack spacing={1.25} sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
      {counts.monthTotal > 0 && (
        <MonthCard total={counts.monthTotal} paid={counts.monthPaid} />
      )}
      <Stack spacing={0.25}>
        <NavLink onNavigate={onNavigate} href="/reglages" current={onSettings}>
          <TuneIcon sx={{ fontSize: 18 }} />
          <Typography sx={textSx}>Réglages</Typography>
        </NavLink>
        <NavLink onNavigate={onNavigate} href="/support" current={onSupport}>
          <HelpOutlineIcon sx={{ fontSize: 18 }} />
          <Typography sx={textSx}>Support</Typography>
        </NavLink>
      </Stack>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.25}
        sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.25 }}
      >
        <UserMenu user={user} userInitials={getUserInitials(user.name)} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            title={user.name ?? undefined}
            sx={{
              fontSize: 13,
              fontWeight: 600,
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
              fontSize: 12,
              color: "text.secondary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {user.email}
          </Typography>
        </Box>
        <ThemeToggle />
      </Stack>
    </Stack>
  </>
  );
}
