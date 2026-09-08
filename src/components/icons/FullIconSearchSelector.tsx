import { useMemo } from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import simpleIconsData from "simple-icons/icons.json";
import { GENERIC_ICONS, getGenericIcon } from "./genericIconMap";

export interface IconOption {
  label: string;
  type: "brand" | "generic";
  slugOrName: string;
}

interface FullIconSearchSelectorProps {
  value: IconOption | null;
  onChange: (newValue: IconOption | null) => void;
}

const popularDefaults: IconOption[] = [
  { label: "Netflix", type: "brand", slugOrName: "netflix" },
  { label: "Spotify", type: "brand", slugOrName: "spotify" },
  { label: "Cloud / Nuage", type: "generic", slugOrName: "Cloud" },
  { label: "Home / Maison", type: "generic", slugOrName: "Home" },
  { label: "Credit Card", type: "generic", slugOrName: "CreditCard" },
];

export default function FullIconSearchSelector({
  value,
  onChange,
}: FullIconSearchSelectorProps) {
  const allOptions: IconOption[] = useMemo(() => {
    const brands: IconOption[] = simpleIconsData.map((icon) => ({
      label: icon.title,
      type: "brand",
      slugOrName: icon.slug,
    }));

    const generics: IconOption[] = GENERIC_ICONS.map((entry) => ({
      label: entry.label,
      type: "generic",
      slugOrName: entry.name,
    }));

    return [...brands, ...generics];
  }, []);

  const renderGenericIcon = (iconName: string) => {
    const IconComponent = getGenericIcon(iconName);
    return <IconComponent />;
  };

  return (
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
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Icône du contrat (optionnel)"
          placeholder="Ex: Netflix, Cloud, House..."
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
  );
}
