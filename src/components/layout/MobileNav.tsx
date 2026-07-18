"use client";

import { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Description as ContractsIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  const menuItems = [
    { text: "Calendrier", icon: <CalendarIcon />, href: "/calendar" },
    { text: "Contrats", icon: <ContractsIcon />, href: "/contracts" },
    { text: "Nouveau contrat", icon: <AddIcon />, href: "/contracts/new" },
    { text: "Dashboard", icon: <DashboardIcon />, href: "/dashboard" },
  ];

  return (
    <>
      <IconButton
        edge="start"
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{ display: { xs: "flex", md: "none" }, mr: 2 }}
      >
        <MenuIcon />
      </IconButton>

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 280, pt: 2 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
