import { createTheme } from "@mui/material/styles";

// Un seul thème, deux palettes : MUI pose la classe sur <html>, retient le
// choix dans localStorage et l'applique avant hydratation (pas de flash).
// Sans choix enregistré, c'est le thème du système qui s'applique.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        // main : remplissages ; light : texte sur fond sombre ; dark : bordures
        // et traits. Tous ≥ 4,5:1 sur le fond, contrastText 11:1 sur main.
        primary: {
          main: "#cafea7",
          light: "#e2ffcf",
          dark: "#9ad776",
          contrastText: "#1a3a0a",
        },
        secondary: {
          main: "#3b82f6", // Bleu
          light: "#60a5fa",
          dark: "#2563eb",
        },
        background: {
          default: "#0b0c10", // Fond sombre profond
          paper: "#15161c",
        },
        text: {
          primary: "#f1f5f9",
          secondary: "#94a3b8",
        },
        success: {
          main: "#10b981", // Emerald
          light: "#34d399",
          dark: "#059669",
        },
        warning: {
          main: "#f59e0b", // Amber
          light: "#fbbf24",
          dark: "#d97706",
          contrastText: "#78350f",
        },
        error: {
          main: "#ef4444", // Red
          light: "#f87171",
          dark: "#dc2626",
        },
        divider: "#262833",
      },
    },
    light: {
      palette: {
        mode: "light",
        // Le vert de marque est trop pâle pour du texte ou un trait sur blanc
        // (1,2:1) : il reste en remplissage, dark porte texte et bordures.
        primary: {
          main: "#cafea7",
          light: "#eaffdb",
          dark: "#3f6d22",
          contrastText: "#1a3a0a",
        },
        secondary: {
          main: "#4f46e5", // Indigo
          light: "#818cf8",
          dark: "#3730a3",
        },
        background: {
          default: "#f4f5f7",
          paper: "#ffffff",
        },
        text: {
          primary: "#111827",
          secondary: "#5b6472",
        },
        success: {
          main: "#10b981", // Emerald
          light: "#34d399",
          dark: "#059669",
        },
        warning: {
          main: "#f59e0b", // Amber
          light: "#fbbf24",
          dark: "#d97706",
          contrastText: "#78350f",
        },
        error: {
          main: "#ef4444", // Red
          light: "#f87171",
          dark: "#dc2626",
        },
        divider: "#e6e8ec",
      },
    },
  },
  typography: {
    fontFamily: "var(--font-sans), 'Inter', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontWeight: 600,
      fontSize: "1rem",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Les montants s'alignent d'une ligne à l'autre.
        body: { fontVariantNumeric: "tabular-nums" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: theme.vars.palette.background.paper,
          borderRadius: 16,
          border: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
});
