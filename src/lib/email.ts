/**
 * Forme canonique d'une adresse e-mail.
 *
 * L'index unique de Postgres est sensible à la casse : sans cette
 * normalisation, « Jean@Example.com » et « jean@example.com » créent deux
 * comptes, et se connecter avec la mauvaise casse échoue silencieusement.
 * Doit être appliquée partout où une adresse sert de clé de recherche.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
