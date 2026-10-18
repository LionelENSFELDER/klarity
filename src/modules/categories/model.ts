// Familles de contrats : types et helpers purs, sans accès base.
// Les contrats référencent une famille par son `slug`, pas par son id :
// le slug reste stable quand le libellé change, et un contrat dont la
// famille a été supprimée retombe proprement en « sans famille ».

export interface Category {
  id: string;
  slug: string;
  label: string;
  color: string;
  position: number;
}

/** Famille de repli pour un contrat dont le slug ne correspond à rien. */
export const NO_CATEGORY: Category = {
  id: "__none__",
  slug: "__none__",
  label: "Sans famille",
  color: "#5c6675",
  position: 999,
};

/** Palette proposée à la création et au changement de couleur. */
export const CATEGORY_PALETTE = [
  "#a78bfa",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#22d3ee",
  "#f472b6",
  "#f87171",
  "#fb923c",
  "#4ade80",
  "#38bdf8",
];

/** Familles créées au premier accès d'un utilisateur. */
export const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { slug: "habitation", label: "Assurance habitation", color: "#a78bfa", position: 0 },
  { slug: "auto", label: "Assurance auto", color: "#60a5fa", position: 1 },
  { slug: "sante", label: "Mutuelle santé", color: "#34d399", position: 2 },
  { slug: "energie", label: "Énergie", color: "#fbbf24", position: 3 },
  { slug: "telecom", label: "Internet & mobile", color: "#22d3ee", position: 4 },
  { slug: "abonnement", label: "Abonnement / streaming", color: "#f472b6", position: 5 },
  { slug: "credit", label: "Crédit", color: "#f87171", position: 6 },
];

/** Retrouve une famille par son slug, ou NO_CATEGORY. */
export function findCategory(categories: Category[], slug: string): Category {
  return categories.find((c) => c.slug === slug) ?? NO_CATEGORY;
}

/**
 * Comparaison tolérante : casse, accents et ponctuation ignorés.
 * Sert à refuser un doublon de famille et à repérer deux saisies
 * du même fournisseur (« EDF » / « E.D.F. »).
 */
export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/** Slug URL-safe dérivé d'un libellé, suffixé si déjà pris. */
export function slugify(label: string, taken: string[] = []): string {
  const base =
    label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "famille";

  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
