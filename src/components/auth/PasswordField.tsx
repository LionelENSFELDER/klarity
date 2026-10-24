"use client";

import { useState } from "react";
import { IconButton, InputAdornment, TextField, type TextFieldProps } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";

/** Champ mot de passe avec un bouton pour afficher ce qu'on tape. */
export default function PasswordField({ slotProps, ...props }: TextFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                onClick={() => setVisible((v) => !v)}
                edge="end"
              >
                {visible ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
