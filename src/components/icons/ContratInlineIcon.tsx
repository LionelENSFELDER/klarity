import React from "react";
import { Avatar, Box } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";

interface ContractInlineIconProps {
  iconType?: string | null;
  iconValue?: string | null;
  name: string;
}

export function ContractInlineIcon({
  iconType,
  iconValue,
  name,
}: ContractInlineIconProps) {
  if (!iconValue || !iconType) {
    return (
      <span style={{ fontSize: "10px", fontWeight: 700, color: "inherit" }}>
        {name ? name.charAt(0).toUpperCase() : "?"}
      </span>
    );
  }

  // 1. Si c'est une marque (stockée via simple-icons)
  if (iconType === "brand") {
    return (
      <Avatar
        src={`https://cdn.simpleicons.org/${iconValue}`}
        alt={name}
        sx={{
          width: 14,
          height: 14,
          bgcolor: "transparent",
          filter: "brightness(0) invert(1)", // Rend l'icône blanche pour contraster avec le fond de la pastille
        }}
      />
    );
  }

  // 2. Si c'est une icône générique (stockée via Material UI)
  if (iconType === "generic") {
    // @ts-ignore
    const IconComponent = (MuiIcons as Record<string, React.ElementType>)[
      iconValue
    ];
    if (IconComponent) {
      return <IconComponent sx={{ fontSize: 14 }} />;
    }
  }

  // Fallback ultime : l'initiale
  return (
    <span style={{ fontSize: "10px", fontWeight: 700, color: "inherit" }}>
      {name ? name.charAt(0).toUpperCase() : "?"}
    </span>
  );
}

export default ContractInlineIcon;
