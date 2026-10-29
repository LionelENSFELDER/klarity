import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";

// Jetons à usage unique envoyés par e-mail (vérification d'adresse, mot de
// passe oublié). La base ne garde que l'empreinte : une fuite de la table ne
// donne aucun lien utilisable.
export type TokenPurpose = "verify" | "reset";

const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");
const identifier = (purpose: TokenPurpose, email: string) => `${purpose}:${email}`;

/** Crée un jeton pour `email` ; les précédents du même usage sont annulés. */
export async function createToken(
  purpose: TokenPurpose,
  email: string,
  ttlMs: number,
): Promise<string> {
  const raw = randomBytes(32).toString("base64url");
  await prisma.verificationToken.deleteMany({ where: { identifier: identifier(purpose, email) } });
  await prisma.verificationToken.create({
    data: {
      identifier: identifier(purpose, email),
      token: hash(raw),
      expires: new Date(Date.now() + ttlMs),
    },
  });
  return raw;
}

/** Consomme le jeton : renvoie l'e-mail associé, ou null s'il est invalide ou expiré. */
export async function consumeToken(purpose: TokenPurpose, raw: string): Promise<string | null> {
  if (!raw) return null;
  const row = await prisma.verificationToken.findFirst({ where: { token: hash(raw) } });
  if (!row || !row.identifier.startsWith(`${purpose}:`)) return null;
  // Usage unique, valide ou non : un jeton lu ne resservira pas.
  await prisma.verificationToken.deleteMany({ where: { identifier: row.identifier } });
  if (row.expires < new Date()) return null;
  return row.identifier.slice(purpose.length + 1);
}
