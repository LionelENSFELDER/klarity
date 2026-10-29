"use client";

import { Box } from "@mui/material";
import type { Category } from "@/modules/categories/model";
import type { SidebarCounts, SidebarUser } from "@/modules/contracts/sidebar";
import NavContent from "./NavContent";

interface AppSidebarProps {
  categories: Category[];
  counts: SidebarCounts;
  user: SidebarUser;
}

// Rail desktop : une enveloppe autour de NavContent, que le tiroir mobile
// rend à l'identique (voir MobileNav).
export default function AppSidebar({
  categories,
  counts,
  user,
}: AppSidebarProps) {
  return (
    <Box
      component="nav"
      aria-label="Navigation"
      sx={{
        // Posé sur le fond, sans panneau ni bordure : le contenu porte les cartes.
        width: 272,
        flex: "none",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <NavContent categories={categories} counts={counts} user={user} />
    </Box>
  );
}
