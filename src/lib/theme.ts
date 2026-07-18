import { createTheme } from "@mui/material/styles";

// Dégradé signature violet → bleu (éléments actifs et actions principales)
export const ACCENT_GRADIENT =
  "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)";

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8b5cf6", // Violet
      light: "#a78bfa",
      dark: "#7c3aed",
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#15161c",
          borderRadius: 16,
          border: "1px solid #262833",
        },
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
          fontWeight: 500,
        },
        containedPrimary: {
          background: ACCENT_GRADIENT,
          color: "#fff",
          "&:hover": {
            background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
  shape: {
    borderRadius: 10,
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb", // Bleu professionnel
      light: "#60a5fa",
      dark: "#1e40af",
    },
    secondary: {
      main: "#4f46e5", // Indigo
      light: "#818cf8",
      dark: "#3730a3",
    },
    background: {
      default: "#f8fafc", // Slate 50
      paper: "#ffffff", // White
    },
    text: {
      primary: "#0f172a", // Slate 900
      secondary: "#475569", // Slate 600
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
    divider: "#e2e8f0", // Slate 200
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
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
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        },
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
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});
