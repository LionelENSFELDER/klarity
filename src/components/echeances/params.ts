// Paramètres d'URL de l'écran d'échéances.
//
// Ce module n'est volontairement PAS "use client" : la page serveur lit les
// searchParams et la vue cliente les consomme. Une valeur exportée depuis un
// module client devient une référence proxy côté serveur — `HORIZONS` ne
// serait alors plus un tableau.

export const HORIZONS = [3, 6, 12] as const;

export type ListId = "a-venir" | "mois" | "tout";
export type ViewId = "liste" | "calendrier";

export interface EcheancesParams {
  liste: ListId;
  categorie: string | null;
  fournisseur: string | null;
  vue: ViewId;
  horizon: number;
}

export const DEFAULT_PARAMS: EcheancesParams = {
  liste: "a-venir",
  categorie: null,
  fournisseur: null,
  vue: "liste",
  horizon: 3,
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Tout paramètre inconnu retombe sur la valeur par défaut. */
export function parseParams(
  raw: Record<string, string | string[] | undefined>,
): EcheancesParams {
  const liste = one(raw.liste);
  const vue = one(raw.vue);
  const horizon = Number(one(raw.horizon));

  return {
    liste: liste === "mois" || liste === "tout" ? liste : "a-venir",
    categorie: one(raw.categorie) || null,
    fournisseur: one(raw.fournisseur) || null,
    vue: vue === "calendrier" ? "calendrier" : "liste",
    horizon: (HORIZONS as readonly number[]).includes(horizon) ? horizon : 3,
  };
}

/** Conserve les filtres actifs en ne changeant qu'un paramètre. */
export function hrefWith(
  params: EcheancesParams,
  patch: Partial<EcheancesParams>,
): string {
  const next = { ...params, ...patch };
  const q = new URLSearchParams();
  if (next.liste !== "a-venir") q.set("liste", next.liste);
  if (next.categorie) q.set("categorie", next.categorie);
  if (next.fournisseur) q.set("fournisseur", next.fournisseur);
  if (next.vue !== "liste") q.set("vue", next.vue);
  if (next.horizon !== 3) q.set("horizon", String(next.horizon));
  const s = q.toString();
  return s ? `/calendar?${s}` : "/calendar";
}
