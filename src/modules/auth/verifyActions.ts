"use server";

import { prisma } from "@/lib/db";
import { normalizeEmail } from "@/lib/email";
import { allowAttempt } from "@/lib/rateLimit";
import { TOO_MANY_ATTEMPTS_MESSAGE } from "@/lib/messages";
import { sendVerificationEmail } from "./verification";

/**
 * Renvoie le lien de vérification depuis la page de connexion. Même réponse
 * que le compte existe ou non.
 */
export async function ResendVerification(
  rawEmail: string,
): Promise<{ success: true } | { error: string }> {
  const email = normalizeEmail(String(rawEmail ?? ""));
  if (!email || email.length > 254) return { error: "Adresse e-mail invalide." };
  if (!(await allowAttempt(`verify:${email}`, 3, 60 * 60 * 1000))) {
    return { error: TOO_MANY_ATTEMPTS_MESSAGE };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.password && !user.emailVerified) await sendVerificationEmail(email);
  return { success: true };
}
