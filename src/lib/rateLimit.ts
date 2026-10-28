// shortcut: compteur en mémoire, propre à chaque instance serveur. Sur Vercel,
// plusieurs instances ont chacune le leur : ça freine un essai de mots de
// passe en série, sans le bloquer. Passer à Upstash ou à une table Postgres
// avant une ouverture publique.
const hits = new Map<string, number[]>();

/** Vrai si `key` a déjà `max` tentatives sur les `windowMs` dernières ms. */
export function isLimited(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.set(key, recent);
  // Borne la mémoire : les clés anciennes disparaissent au fil des appels.
  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return recent.length >= max;
}

/** Compte une tentative pour `key`. */
export function recordAttempt(key: string, now = Date.now()): void {
  hits.set(key, [...(hits.get(key) ?? []), now]);
}

/** Compte la tentative et dit si elle reste sous la limite. */
export function allowAttempt(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
): boolean {
  if (isLimited(key, max, windowMs, now)) return false;
  recordAttempt(key, now);
  return true;
}

/**
 * Adresse du client derrière le proxy (Vercel renseigne x-forwarded-for).
 * null si inconnue : une clé commune ferait de la limite par IP une limite
 * globale, qui bloquerait tout le monde.
 */
export function clientIp(headers: Headers | Record<string, unknown> | undefined): string | null {
  const raw =
    headers instanceof Headers
      ? headers.get("x-forwarded-for")
      : (headers?.["x-forwarded-for"] as string | undefined);
  return raw?.split(",")[0]?.trim() || null;
}
