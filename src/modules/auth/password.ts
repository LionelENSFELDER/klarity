"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";
import { appUrl, sendMail } from "@/lib/mailer";
import { allowAttempt, clientIp } from "@/lib/rateLimit";
import { TOO_MANY_ATTEMPTS_MESSAGE } from "@/lib/messages";
import { consumeToken, createToken } from "./tokens";
import { validatePassword } from "./registration";

type Result = { success: true } | { error: string };

const ONE_HOUR = 60 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * Envoie un lien de réinitialisation. La réponse est la même que l'adresse
 * ait un compte ou non : la page ne doit pas révéler qui est inscrit.
 * Un compte créé avec Google peut ainsi se donner un mot de passe.
 */
export async function RequestPasswordReset(rawEmail: string): Promise<Result> {
  const email = normalizeEmail(String(rawEmail ?? ""));
  if (!email || email.length > 254) return { error: "Adresse e-mail invalide." };

  const ip = clientIp(await headers());
  if (
    !(await allowAttempt(`reset:${email}`, 3, ONE_HOUR)) ||
    (ip && !(await allowAttempt(`reset-ip:${ip}`, 10, ONE_HOUR)))
  ) {
    return { error: TOO_MANY_ATTEMPTS_MESSAGE };
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const token = await createToken("reset", email, ONE_HOUR);
    await sendMail({
      to: email,
      subject: "Réinitialiser votre mot de passe Klarity",
      text: [
        "Bonjour,",
        "",
        "Pour choisir un nouveau mot de passe, ouvrez ce lien (valable une heure) :",
        appUrl(`/auth/reinitialiser?token=${token}`),
        "",
        "Si vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe reste inchangé.",
      ].join("\n"),
    });
  }
  return { success: true };
}

/**
 * Pose le nouveau mot de passe. Ouvrir le lien prouve la possession de
 * l'adresse : elle est marquée vérifiée. Toutes les sessions sont fermées.
 */
export async function ResetPassword(token: string, password: string): Promise<Result> {
  const invalid = validatePassword(password);
  if (invalid) return { error: invalid };

  const email = await consumeToken("reset", String(token ?? ""));
  if (!email) return { error: "Ce lien est invalide ou a expiré. Demandez-en un nouveau." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Ce lien est invalide ou a expiré. Demandez-en un nouveau." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await bcrypt.hash(password, 12),
      emailVerified: user.emailVerified ?? new Date(),
      tokenVersion: { increment: 1 },
    },
  });
  return { success: true };
}

/** Change le mot de passe depuis les réglages ; ferme toutes les sessions. */
export async function ChangePassword(current: string, next: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Session expirée. Reconnecte-toi." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) {
    return { error: "Ce compte n'a pas de mot de passe : utilise « Mot de passe oublié » pour en définir un." };
  }

  const key = `change-password:${user.id}`;
  if (!(await allowAttempt(key, 5, FIFTEEN_MINUTES))) return { error: TOO_MANY_ATTEMPTS_MESSAGE };
  if (!(await bcrypt.compare(String(current ?? ""), user.password))) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const invalid = validatePassword(next);
  if (invalid) return { error: invalid };

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(next, 12), tokenVersion: { increment: 1 } },
  });
  return { success: true };
}
