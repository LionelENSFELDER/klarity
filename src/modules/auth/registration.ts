import { normalizeEmail } from "@/lib/email";

export const PASSWORD_MIN_LENGTH = 8;

/** Message affiché sur la page de connexion après une inscription réussie. */
export const REGISTRATION_SUCCESS_MESSAGE = "Compte créé avec succès";

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

  if (rawPassword.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`,
    };
  }

  return {
    ok: true,
    email,
    password: rawPassword,
    name: rawName.trim() || null,
  };
}
