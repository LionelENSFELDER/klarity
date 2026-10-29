import { normalizeEmail } from "@/lib/email";

// 12 caractères : recommandation de l'ANSSI sans double authentification.
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72;

/**
 * Règle commune à l'inscription, la réinitialisation et le changement de mot
 * de passe. Renvoie le message d'erreur, ou null si le mot de passe convient.
 *
 * La borne haute compte des octets : bcrypt ignore tout au-delà de 72 octets,
 * et un caractère accentué ou un emoji en occupe plusieurs. Elle évite aussi
 * de faire hacher une chaîne énorme au serveur.
 */
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || !password) return "Mot de passe requis";
  if (new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH) {
    return `Le mot de passe doit contenir au plus ${PASSWORD_MAX_LENGTH} octets (environ ${PASSWORD_MAX_LENGTH} caractères sans accents)`;
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`;
  }
  return null;
}

/** Message affiché sur la page de connexion après une inscription réussie. */
export const REGISTRATION_SUCCESS_MESSAGE =
  "Vérifiez votre boîte mail : un lien de confirmation vient de partir. Ouvrez-le, puis connectez-vous.";

export interface RegistrationInput {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}

export type RegistrationResult =
  | { ok: true; name: string | null; email: string; password: string }
  | { ok: false; error: string };

// Volontairement permissif : la seule garantie utile ici est qu'une adresse
// a bien une partie locale et un domaine. La validation réelle d'une adresse
// passe par l'envoi d'un e-mail, pas par une expression régulière.
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valide et normalise une demande d'inscription.
 *
 * Fonction pure, séparée de la route HTTP : elle est ainsi testable sans
 * base de données ni requête, et la route se limite à l'accès aux données.
 */
export function validateRegistration(
  input: RegistrationInput,
): RegistrationResult {
  const rawEmail = typeof input.email === "string" ? input.email : "";
  const rawPassword = typeof input.password === "string" ? input.password : "";
  const rawName = typeof input.name === "string" ? input.name : "";

  if (!rawEmail.trim() || !rawPassword) {
    return { ok: false, error: "Email et mot de passe requis" };
  }

  const email = normalizeEmail(rawEmail);
  if (!EMAIL_SHAPE.test(email)) {
    return { ok: false, error: "Adresse e-mail invalide" };
  }

  if (email.length > 254 || rawName.length > 100) {
    return { ok: false, error: "Nom ou adresse e-mail trop long" };
  }

  const passwordError = validatePassword(rawPassword);
  if (passwordError) return { ok: false, error: passwordError };

  return {
    ok: true,
    email,
    password: rawPassword,
    name: rawName.trim() || null,
  };
}
