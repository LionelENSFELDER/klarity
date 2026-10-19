"use client";

import { Suspense, useState } from "react";
import { Box, Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import type { Category } from "@/modules/categories/model";
import type { SidebarCounts, SidebarUser } from "@/modules/contracts/sidebar";
import NavContent from "./NavContent";

interface MobileNavProps {
  categories: Category[];
  counts: SidebarCounts;
  user: SidebarUser;
}

// Le tiroir rend exactement le même contenu que le rail desktop : listes,
// catégories, fournisseurs, réglages, profil. L'app étant surtout utilisée
// sur mobile, rien ne doit être réservé au grand écran.
export default function MobileNav({
  categories,
  counts,
  user,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="Ouvrir la navigation"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { sx: { width: 288, bgcolor: "background.paper" } } }}
      >
        <Box
          component="nav"
          aria-label="Navigation"
          sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
        >
          {/* useSearchParams exige une frontière Suspense hors rendu dynamique */}
          <Suspense fallback={null}>
            <NavContent
              categories={categories}
              counts={counts}
              user={user}
              onNavigate={() => setOpen(false)}
            />
          </Suspense>
        </Box>
      </Drawer>
    </>
  );
}
