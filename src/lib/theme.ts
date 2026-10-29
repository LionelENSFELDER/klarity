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
          default: "#0e0f0d",
          paper: "#181a17",
        },
        text: {
          primary: "#f1f2ee",
          secondary: "#a3a89f",
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
        divider: "#2c2f29",
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
          dark: "#16331d", // vert profond : texte, traits, action principale (13:1)
          contrastText: "#1a3a0a",
        },
        secondary: {
          main: "#4f46e5", // Indigo
          light: "#818cf8",
          dark: "#3730a3",
        },
        // Fond chaud : le rail y est posé, le contenu vit en cartes blanches.
        background: {
          default: "#ecebe6",
          paper: "#ffffff",
        },
        text: {
          primary: "#1a1c19",
          secondary: "#5a5e57", // 4,6:1 sur le fond, 6,4:1 sur blanc
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
        divider: "#e7e5e0",
      },
    },
  },
  // Titres en graisse normale : la hiérarchie vient de la taille, pas du gras.
  typography: {
    fontFamily: "var(--font-sans), 'Inter', sans-serif",
    h1: { fontWeight: 400, fontSize: "2rem", letterSpacing: "-0.02em" },
    h2: { fontWeight: 400, fontSize: "1.75rem", letterSpacing: "-0.02em" },
    h3: { fontWeight: 400, fontSize: "1.5rem", letterSpacing: "-0.01em" },
    h4: { fontWeight: 400, fontSize: "1.3125rem" },
    h5: { fontWeight: 400, fontSize: "1.125rem" },
    h6: { fontWeight: 500, fontSize: "1rem" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Les montants s'alignent d'une ligne à l'autre.
        body: { fontVariantNumeric: "tabular-nums" },
      },
    },
    // Carte : blanche, rayon 28, ni bordure ni ombre (voir ui/surface).
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          backgroundColor: theme.vars.palette.background.paper,
          borderRadius: `calc(2 * ${theme.vars.shape.borderRadius})`,
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
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: `calc(2 * ${theme.vars.shape.borderRadius})`,
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({ borderRadius: theme.vars.shape.borderRadius }),
      },
    },
    // Boutons en pilule. Une seule action pleine par écran : en clair elle est
    // vert profond (le vert de marque est illisible en texte), en sombre elle
    // reprend le vert de marque.
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          boxShadow: "none",
          borderRadius: 999,
          paddingInline: 18,
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.vars.palette.primary.dark,
          color: theme.vars.palette.common.white,
          "&:hover": { backgroundColor: "#0e2414" },
          ...theme.applyStyles("dark", {
            backgroundColor: theme.vars.palette.primary.main,
            color: theme.vars.palette.primary.contrastText,
            "&:hover": { backgroundColor: theme.vars.palette.primary.light },
          }),
        }),
        textPrimary: ({ theme }) => ({ color: theme.vars.palette.primary.dark }),
        outlinedPrimary: ({ theme }) => ({
          color: theme.vars.palette.primary.dark,
          borderColor: theme.vars.palette.divider,
          backgroundColor: theme.vars.palette.background.paper,
        }),
      },
    },
    MuiLink: {
      styleOverrides: {
        root: ({ theme }) => ({ color: theme.vars.palette.primary.dark }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({ backgroundColor: theme.vars.palette.background.paper }),
      },
    },
    // Onglets et bascules : contrôle segmenté, l'élément choisi devient une
    // pilule blanche sur un rail gris.
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 0,
          padding: 4,
          borderRadius: 999,
          backgroundColor: theme.vars.palette.action.hover,
          display: "inline-flex",
          maxWidth: "100%",
        }),
        indicator: { display: "none" },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: 40,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 500,
          fontSize: 14,
          color: theme.vars.palette.text.secondary,
          "&.Mui-selected": {
            color: theme.vars.palette.text.primary,
            backgroundColor: theme.vars.palette.background.paper,
            boxShadow: "0 1px 2px rgba(20,22,18,0.08)",
          },
        }),
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: 4,
          gap: 2,
          borderRadius: 999,
          backgroundColor: theme.vars.palette.action.hover,
        }),
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          border: 0,
          borderRadius: "999px !important",
          paddingInline: 14,
          gap: 6,
          textTransform: "none",
          fontWeight: 500,
          color: theme.vars.palette.text.secondary,
          "&.Mui-selected, &.Mui-selected:hover": {
            color: theme.vars.palette.text.primary,
            backgroundColor: theme.vars.palette.background.paper,
            boxShadow: "0 1px 2px rgba(20,22,18,0.08)",
          },
        }),
      },
    },
    // Étiquette d'état : pilule, contour discret.
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 500 },
      },
    },
  },
  // Rayon de base : `borderRadius: 1` vaut 14 (entrées, champs, blocs),
  // `borderRadius: 2` vaut 28 (cartes). Les pilules utilisent 999.
  shape: {
    borderRadius: 14,
  },
});
