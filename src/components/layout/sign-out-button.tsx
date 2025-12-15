"use client";

import { signOut } from "next-auth/react";
import { MenuItem } from "@mui/material";

export function SignOutButton() {
  return (
    <MenuItem
      sx={{
        cursor: "pointer",
        color: "error.main",
        "&:hover": {
          color: "error.dark",
          bgcolor: "error.lighter",
        },
      }}
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
    >
      🚪 Déconnexion
    </MenuItem>
  );
}
