import { createTheme } from "@mui/material/styles";

// Dégradé signature violet → bleu (éléments actifs et actions principales)
export const ACCENT_GRADIENT =
  "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)";

// Teintes de graphique, validées sur fond sombre (contraste, bande de
// luminosité, séparation en déficience visuelle). Le couple BASE/EXTRA est à
// ΔE 32,9 en protanopie. Les couleurs de catégorie ne conviennent PAS ici :
// bleu et violet y sont indiscernables en deutéranopie, elles ne tiennent que
// collées à leur libellé dans le rail.
export const CHART_BASE = "#8b5cf6";
export const CHART_EXTRA = "#d97706";
export const CHART_MUTED = "#4b5366";

// Un seul thème, deux palettes : MUI pose la classe sur <html>, retient le
// choix dans localStorage et l'applique avant hydratation (pas de flash).
// Sans choix enregistré, c'est le thème du système qui s'applique.
export const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        // light sert de couleur de texte sur fond sombre (contraste ≥ 4,5:1).
        primary: {
          main: "#7c3aed",
          light: "#a78bfa",
          dark: "#6d28d9",
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
        primary: {
          main: "#6d28d9",
          light: "#a78bfa",
          dark: "#5b21b6",
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
    fontFamily: "var(--font-sans), 'Inter', 'Roboto', sans-serif",
    h1: {
      fontFamily: "var(--font-display), 'Inter', sans-serif",
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontFamily: "var(--font-display), 'Inter', sans-serif",
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontFamily: "var(--font-display), 'Inter', sans-serif",
      fontWeight: 600,
      fontSize: "1.75rem",
    },
    h4: {
      fontFamily: "var(--font-display), 'Inter', sans-serif",
      fontWeight: 600,
      fontSize: "1.5rem",
    },
    h5: {
      fontFamily: "var(--font-display), 'Inter', sans-serif",
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h6: {
      fontFamily: "var(--font-display), 'Inter', sans-serif",
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

