import { createHash } from "node:crypto";
import { prisma } from "./db";

// Compteur partagé en base : il tient sur toutes les instances serveur et ne
// grossit pas en mémoire. Les clés contiennent des e-mails et des adresses IP :
// seule leur empreinte est stockée.
const hashKey = (key: string) => createHash("sha256").update(key).digest("hex");

/** Au-delà, une tentative ne sert plus à aucune fenêtre : on l'efface. */
const RETENTION_MS = 24 * 60 * 60 * 1000;

/** Vrai si `key` a déjà `max` tentatives sur les `windowMs` dernières ms. */
export async function isLimited(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
): Promise<boolean> {
  const recent = await prisma.rateLimitHit.count({
    where: { key: hashKey(key), createdAt: { gte: new Date(now - windowMs) } },
  });
  return recent >= max;
}

/** Compte une tentative pour `key` et purge les tentatives périmées. */
export async function recordAttempt(key: string, now = Date.now()): Promise<void> {
  await prisma.rateLimitHit.create({
    data: { key: hashKey(key), createdAt: new Date(now) },
  });
  await prisma.rateLimitHit.deleteMany({
    where: { createdAt: { lt: new Date(now - RETENTION_MS) } },
  });
}

/** Compte la tentative et dit si elle reste sous la limite. */
export async function allowAttempt(
  key: string,
  max: number,
  windowMs: number,
  now = Date.now(),
): Promise<boolean> {
  if (await isLimited(key, max, windowMs, now)) return false;
  await recordAttempt(key, now);
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
