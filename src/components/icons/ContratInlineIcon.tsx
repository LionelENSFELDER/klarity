import React from "react";
import { Avatar } from "@mui/material";
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
      <span style={{ fontSize: "10px", fontWeight: 700, color: "transparent" }}>
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
          width: 20,
          height: 20,
          bgcolor: "transparent",
          // filter: "brightness(0) invert(1)",
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
      return <IconComponent sx={{ fontSize: 20 }} />;
    }
  }

  // Fallback ultime : l'initiale
  return (
    <span style={{ fontSize: "20px", fontWeight: 700, color: "inherit" }}>
      {name ? name.charAt(0).toUpperCase() : "?"}
    </span>
  );
}

export default ContractInlineIcon;
