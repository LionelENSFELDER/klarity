"use client";

import Link from "next/link";
import { Box, Stack, Typography, IconButton, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InboxIcon from "@mui/icons-material/Inbox";
import { ACCENT_GRADIENT } from "@/lib/theme";
import { formatEuro } from "@/modules/contracts/calendar";
import { NO_CATEGORY, type Category } from "@/modules/categories/model";
import AddContractButton from "@/components/contracts/AddContractButton";

export interface SidebarCounts {
  aVenir: number;
  mois: number;
  tout: number;
  byCategory: Record<string, number>;
  orphans: number;
  providers: { name: string; count: number; monthlyCost: number }[];
}

interface AppSidebarProps {
  categories: Category[];
  counts: SidebarCounts;
  /** Paramètres d'URL actifs, pour marquer l'entrée courante. */
  active: { liste: string; famille: string | null; fournisseur: string | null };
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
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box
      component={Link}
      href={href}
      aria-current={current ? "page" : undefined}
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
          background: current ? ACCENT_GRADIENT : "rgba(255,255,255,0.045)",
        },
      }}
    >
      {children}
    </Box>
  );
}

function SectionLabel({
  children,
  settingsTab,
}: {
  children: React.ReactNode;
  settingsTab?: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 1, pb: 0.9 }}
    >
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "#5c6675",
        }}
      >
        {children}
      </Typography>
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

export default function AppSidebar({
  categories,
  counts,
  active,
}: AppSidebarProps) {
  const noFilter = !active.famille && !active.fournisseur;
  // Une famille sans contrat reste dans les réglages mais disparaît du rail.
  const shown = categories.filter((c) => (counts.byCategory[c.slug] ?? 0) > 0);

  return (
    <Box
      component="nav"
      aria-label="Navigation"
      sx={{
        width: 264,
        flex: "none",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRight: 1,
        borderColor: "divider",
        minHeight: 0,
      }}
    >
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.25, py: 1.5 }}>
        <Stack spacing={0.25}>
          {LISTS.map((l) => {
            const Icon = l.icon;
            const current = noFilter && active.liste === l.id;
            const count =
              l.id === "a-venir"
                ? counts.aVenir
                : l.id === "mois"
                  ? counts.mois
                  : counts.tout;
            return (
              <NavLink key={l.id} href={`/calendar?liste=${l.id}`} current={current}>
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

        <Box sx={{ mt: 2.25 }}>
          <SectionLabel settingsTab="familles">Familles</SectionLabel>
          <Stack spacing={0.25}>
            {shown.map((cat) => {
              const current = active.famille === cat.slug;
              return (
                <NavLink
                  key={cat.slug}
                  href={`/calendar?famille=${encodeURIComponent(cat.slug)}`}
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
              <NavLink
                href={`/calendar?famille=${NO_CATEGORY.slug}`}
                current={active.famille === NO_CATEGORY.slug}
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
                Aucune famille utilisée
              </Typography>
            )}
          </Stack>
        </Box>

        <Box sx={{ mt: 2.25 }}>
          <SectionLabel settingsTab="fournisseurs">Fournisseurs</SectionLabel>
          <Stack spacing={0.25}>
            {counts.providers.map((p) => {
              const current = active.fournisseur === p.name;
              return (
                <NavLink
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
          </Stack>
        </Box>
      </Box>

      <Stack spacing={0.9} sx={{ p: 1.25, borderTop: 1, borderColor: "divider" }}>
        <NavLink href="/reglages" current={false}>
          <SettingsIcon sx={{ fontSize: 16, opacity: 0.85 }} />
          <Typography sx={{ ...textSx, color: "text.secondary" }}>Réglages</Typography>
        </NavLink>
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
    </Box>
  );
}
