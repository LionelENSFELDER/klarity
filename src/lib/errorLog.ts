// Journal d'erreurs structuré : une ligne JSON par erreur, sur la sortie
// d'erreur, que les journaux Vercel indexent et filtrent (level=error).
// Rien de personnel : pas d'e-mail, pas de corps de requête, pas de
// paramètres d'URL (ils peuvent contenir un jeton de réinitialisation).

const MAX_FIELD = 500;

export interface ErrorEntry {
  source: "server" | "client";
  message?: string;
  digest?: string;
  path?: string;
  [key: string]: string | undefined;
}

const clip = (v: unknown) => (typeof v === "string" ? v.slice(0, MAX_FIELD) : undefined);

/** Chemin sans paramètres ni fragment. */
export const bare = (path: unknown) => clip(typeof path === "string" ? path.split(/[?#]/)[0] : undefined);

export function logError(entry: ErrorEntry): void {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(entry)) {
    const value = k === "path" ? bare(v) : clip(v);
    if (value) clean[k] = value;
  }
  console.error(JSON.stringify({ level: "error", at: new Date().toISOString(), ...clean }));
}
