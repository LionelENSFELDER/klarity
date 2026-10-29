import bcrypt from "bcryptjs";

// Empreinte d'un mot de passe que personne ne connaît, au même coût que les
// vraies : calculée une fois, à la première connexion.
let dummyHash: Promise<string> | null = null;

/**
 * Compare un mot de passe à l'empreinte du compte. Sans compte (ou sans mot
 * de passe), la comparaison a quand même lieu contre une empreinte factice :
 * le temps de réponse ne révèle pas si l'adresse est inscrite.
 */
export async function checkPassword(password: string, hash: string | null | undefined): Promise<boolean> {
  if (hash) return bcrypt.compare(password, hash);
  dummyHash ??= bcrypt.hash("klarity-compte-inexistant", 12);
  await bcrypt.compare(password, await dummyHash);
  return false;
}
