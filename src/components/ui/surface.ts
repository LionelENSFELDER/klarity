/** Carte de contenu : blanche, rayon 28, ni bordure ni ombre. */
export const cardSx = {
  bgcolor: "background.paper",
  borderRadius: 2,
} as const;

/**
 * Boîte qui défile seule à partir de md, quand l'écran tient dans la
 * fenêtre ; sur mobile c'est la page qui défile.
 */
export const scrollBoxSx = {
  minHeight: 0,
  overflowY: { md: "auto" },
} as const;

/** Bloc posé à l'intérieur d'une carte. */
export const insetSx = {
  bgcolor: "action.hover",
  borderRadius: 1.5,
} as const;

/** Pastille de compteur, sombre ; `alert` pour ce qui demande une action. */
export const countBadgeSx = (alert = false) =>
  ({
    minWidth: 24,
    height: 24,
    px: 0.875,
    boxSizing: "border-box",
    borderRadius: 999,
    bgcolor: alert ? "#b4532f" : "primary.dark",
    color: "common.white",
    fontSize: 12,
    fontWeight: 500,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    ".dark &": alert ? {} : { bgcolor: "primary.main", color: "primary.contrastText" },
  }) as const;

/** Remplissage hachuré des jauges et barres : deux tons d'une même couleur. */
export const hatch = (a: string, b: string) =>
  `repeating-linear-gradient(135deg, ${a} 0 6px, ${b} 6px 9px)`;
