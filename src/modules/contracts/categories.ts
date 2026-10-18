// Fréquences de prélèvement. Les familles de contrats vivent désormais en
// base (voir src/modules/categories) : elles sont éditables par l'utilisateur.

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
