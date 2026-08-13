import React, { useState, useMemo } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import * as simpleIcons from "simple-icons";
import * as MuiIcons from "@mui/icons-material";

interface IconOption {
  label: string;
  type: "brand" | "generic";
  slugOrName: string;
}

const popularDefaults: IconOption[] = [
  { label: "Netflix", type: "brand", slugOrName: "netflix" },
  { label: "Spotify", type: "brand", slugOrName: "spotify" },
  { label: "Cloud / Nuage", type: "generic", slugOrName: "Cloud" },
  { label: "Home / Maison", type: "generic", slugOrName: "Home" },
  { label: "Credit Card", type: "generic", slugOrName: "CreditCard" },
];

export default function UniversalIconSearchSelector() {
  const [selectedOption, setSelectedOption] = useState<IconOption | null>(null);

  const allOptions: IconOption[] = useMemo(() => {
    const brands: IconOption[] = Object.values(simpleIcons)
      .filter((icon: any) => icon && icon.title && icon.slug)
      .map((icon: any) => ({
        label: icon.title,
        type: "brand",
        slugOrName: icon.slug,
      }));

    const generics: IconOption[] = Object.keys(MuiIcons)
      .filter(
        (key) =>
          key !== "default" &&
          !key.endsWith("Outlined") &&
          !key.endsWith("Rounded") &&
          !key.endsWith("Sharp") &&
          !key.endsWith("TwoTone"),
      )
      .map((key) => ({
        label: key.replace(/([A-Z])/g, " $1").trim(),
        type: "generic",
        slugOrName: key,
      }));

    return [...brands, ...generics];
  }, []);

  const renderGenericIcon = (iconName: string) => {
    const IconComponent = (MuiIcons as Record<string, React.ElementType>)[
      iconName
    ];
    return IconComponent ? <IconComponent /> : <MuiIcons.Help />;
  };

  return (
    <Box sx={{ width: 400, display: "flex", flexDirection: "column", gap: 2 }}>
      <Autocomplete
        options={allOptions}
        getOptionLabel={(option) => option.label}
        filterOptions={(options, { inputValue }) => {
          if (!inputValue || inputValue.trim().length === 0) {
            return popularDefaults;
          }
          const searchTerm = inputValue.toLowerCase();
          return options
            .filter(
              (option) =>
                option.label.toLowerCase().includes(searchTerm) ||
                option.slugOrName.toLowerCase().includes(searchTerm),
            )
            .slice(0, 50);
        }}
        value={selectedOption}
        onChange={(event, newValue) => setSelectedOption(newValue)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Rechercher une marque ou une icône..."
            placeholder="Ex: Netflix, Cloud, House, Music..."
          />
        )}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <Box
              component="li"
              key={`${option.type}-${option.slugOrName}`}
              {...otherProps}
              sx={{ display: "flex", gap: 2, alignItems: "center" }}
            >
              {option.type === "brand" ? (
                <Avatar
                  src={`https://cdn.simpleicons.org/${option.slugOrName}`}
                  alt={option.label}
                  sx={{ width: 24, height: 24, bgcolor: "transparent" }}
                />
              ) : (
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                  }}
                >
                  {renderGenericIcon(option.slugOrName)}
                </Box>
              )}
              <Typography>{option.label}</Typography>
            </Box>
          );
        }}
      />

      {/* Preview dev only */}
      {selectedOption && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid #ddd",
            borderRadius: 2,
          }}
        >
          {selectedOption.type === "brand" ? (
            <Avatar
              src={`https://cdn.simpleicons.org/${selectedOption.slugOrName}`}
              sx={{ width: 32, height: 32, bgcolor: "transparent" }}
            />
          ) : (
            <Box
              sx={{
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              {renderGenericIcon(selectedOption.slugOrName)}
            </Box>
          )}
          <Typography>
            En BDD : type = <strong>{selectedOption.type}</strong> | valeur ={" "}
            <strong>{selectedOption.slugOrName}</strong>
          </Typography>
        </Box>
      )}
    </Box>
  );
}
