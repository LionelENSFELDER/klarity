// Référentiel des catégories de contrats — couleurs partagées
// entre la vue calendrier et le formulaire d'ajout.

export type CategoryId =
  | "habitation"
  | "auto"
  | "sante"
  | "energie"
  | "telecom"
  | "abonnement"
  | "credit";

export interface Category {
  id: CategoryId;
  label: string;
  color: string;
  examples: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "habitation",
    label: "Assurance habitation",
    color: "#a78bfa", // violet
    examples: "MAAF, MAIF…",
  },
  {
    id: "auto",
    label: "Assurance auto",
    color: "#60a5fa", // bleu
    examples: "MAIF, Direct Assurance…",
  },
  {
    id: "sante",
    label: "Mutuelle santé",
    color: "#34d399", // émeraude
    examples: "Alan, Harmonie…",
  },
  {
    id: "energie",
    label: "Énergie",
    color: "#fbbf24", // ambre
    examples: "EDF, Engie…",
  },
  {
    id: "telecom",
    label: "Internet & mobile",
    color: "#22d3ee", // cyan
    examples: "Free, Orange…",
  },
  {
    id: "abonnement",
    label: "Abonnement / streaming",
    color: "#f472b6", // rose
    examples: "Netflix, Spotify…",
  },
  {
    id: "credit",
    label: "Crédit",
    color: "#f87171", // rouge doux
    examples: "Crédit immobilier…",
  },
];

const FALLBACK_COLOR = "#94a3b8";

export function getCategory(id: string): Category {
  return (
    CATEGORIES.find((c) => c.id === id) ?? {
      id: "abonnement",
      label: id || "Autre",
      color: FALLBACK_COLOR,
      examples: "",
    }
  );
}

export const FREQUENCIES = [
  { id: "once", label: "Une fois" },
  { id: "monthly", label: "Mensuel" },
  { id: "quarterly", label: "Trimestriel" },
  { id: "annual", label: "Annuel" },
] as const;

export type FrequencyId = (typeof FREQUENCIES)[number]["id"];

export function getFrequencyLabel(id: string): string {
  return FREQUENCIES.find((f) => f.id === id)?.label ?? id;
}
