"use client";

import { useState } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import {
  AccountCircle,
  CreditCard,
  Palette,
  Help,
  Logout,
} from "@mui/icons-material";
import { signOut } from "next-auth/react";

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  userInitials: string;
}

export default function UserMenu({ user, userInitials }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      <IconButton onClick={handleClick} size="small" sx={{ p: 0 }}>
        <Avatar
          src={user?.image || undefined}
          alt={user?.name || "User"}
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.light",
            color: "primary.dark",
            fontWeight: 600,
            fontSize: "0.875rem",
          }}
        >
          {userInitials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          sx: { width: 250, mt: 1.5 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            {user?.name || "Utilisateur"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem>
          <AccountCircle sx={{ mr: 1.5 }} fontSize="small" />
          Profil
        </MenuItem>
        <MenuItem>
          <CreditCard sx={{ mr: 1.5 }} fontSize="small" />
          Facturation
        </MenuItem>
        <MenuItem>
          <Palette sx={{ mr: 1.5 }} fontSize="small" />
          Thème
        </MenuItem>
        <Divider />
        <MenuItem>
          <Help sx={{ mr: 1.5 }} fontSize="small" />
          Aide & Support
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <Logout sx={{ mr: 1.5 }} fontSize="small" />
          Déconnexion
        </MenuItem>
      </Menu>
    </>
  );
}
