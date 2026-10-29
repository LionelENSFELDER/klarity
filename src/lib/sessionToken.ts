import type { JWT } from "next-auth/jwt";

/**
 * Valide le jeton de session à chaque lecture. La session est un JWT, sans
 * état côté serveur : pour pouvoir la révoquer, le jeton porte la version de
 * session de l'utilisateur au moment de la connexion. Changer de mot de
 * passe ou « se déconnecter partout » incrémente la version ; un compte
 * supprimé n'en a plus. Dans les deux cas le jeton est vidé : la page
 * redirige vers la connexion.
 *
 * `userId` n'est fourni qu'à la connexion. `loadVersion` renvoie null si le
 * compte n'existe plus.
 */
export async function resolveToken(
  token: JWT,
  userId: string | undefined,
  loadVersion: (id: string) => Promise<number | null>,
): Promise<JWT> {
  if (userId) {
    return { ...token, sub: userId, ver: (await loadVersion(userId)) ?? 0 };
  }
  if (!token.sub) return token;

  const current = await loadVersion(token.sub);
  // Jetons émis avant l'ajout de la version : ils valent la version 0.
  if (current === null || current !== (token.ver ?? 0)) return {};
  return token;
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Version de session de l'utilisateur à l'émission du jeton. */
    ver?: number;
  }
}
