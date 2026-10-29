import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { appUrl, sendMail } from "@/lib/mailer";
import { consumeToken, createToken } from "./tokens";
import type { RegistrationResult } from "./registration";

// Vérification d'adresse : un compte e-mail + mot de passe ne peut se
// connecter qu'après avoir ouvert le lien reçu. Sans elle, n'importe qui
// pourrait occuper l'adresse d'un autre.

const ONE_DAY = 24 * 60 * 60 * 1000;

/** Envoie (ou renvoie) le lien de vérification. */
export async function sendVerificationEmail(email: string): Promise<void> {
  const token = await createToken("verify", email, ONE_DAY);
  await sendMail({
    to: email,
    subject: "Confirmez votre adresse e-mail pour Klarity",
    text: [
      "Bonjour,",
      "",
      "Pour activer votre compte Klarity, ouvrez ce lien (valable 24 heures) :",
      appUrl(`/auth/verifier?token=${token}`),
      "",
      "Si vous n'avez pas créé de compte, ignorez ce message.",
    ].join("\n"),
  });
}

/** Marque l'adresse vérifiée. Renvoie l'e-mail, ou null si le lien est invalide. */
export async function verifyEmail(token: string): Promise<string | null> {
  const email = await consumeToken("verify", token);
  if (!email) return null;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  if (!user.emailVerified) {
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
  }
  return email;
}

/**
 * Inscription. Le résultat est le même dans tous les cas (« vérifiez votre
 * boîte mail ») : la réponse ne révèle pas si l'adresse a déjà un compte.
 * - Nouvelle adresse : compte créé, lien de vérification envoyé.
 * - Compte jamais vérifié : nom et mot de passe remplacés (personne n'a pu
 *   s'en servir), lien renvoyé.
 * - Compte vérifié ou créé avec Google : le titulaire est prévenu par
 *   e-mail, rien ne change.
 */
export async function registerAccount(
  input: Extract<RegistrationResult, { ok: true }>,
): Promise<void> {
  const { email, name, password } = input;
  const existing = await prisma.user.findUnique({
    where: { email },
    include: { accounts: { select: { id: true } } },
  });

  if (existing && (existing.emailVerified || existing.accounts.length > 0)) {
    await sendMail({
      to: email,
      subject: "Votre compte Klarity existe déjà",
      text: [
        "Bonjour,",
        "",
        "Quelqu'un (vous, sans doute) a voulu créer un compte Klarity avec cette adresse, qui en a déjà un.",
        `Connectez-vous : ${appUrl("/auth/signin")}`,
        `Mot de passe oublié : ${appUrl("/auth/mot-de-passe-oublie")}`,
        "",
        "Si ce n'était pas vous, ignorez ce message : rien n'a changé.",
      ].join("\n"),
    });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  if (existing) {
    await prisma.user.update({ where: { id: existing.id }, data: { name, password: hashed } });
  } else {
    await prisma.user.create({ data: { email, name, password: hashed } });
  }
  await sendVerificationEmail(email);
}
