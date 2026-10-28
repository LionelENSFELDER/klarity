"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizeEmail } from "@/lib/email";

type Result = { success: true } | { error: string };

/**
 * Supprime définitivement le compte et toutes ses données. Contrats,
 * catégories, comptes OAuth et sessions partent en cascade (schéma Prisma).
 * L'utilisateur doit retaper son e-mail : une suppression par erreur est
 * irrattrapable.
 */
export async function DeleteAccount(confirmEmail: string): Promise<Result> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Session expirée. Reconnecte-toi." };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return { error: "Compte introuvable." };
  if (normalizeEmail(confirmEmail) !== user.email) {
    return { error: "L'adresse saisie ne correspond pas à celle du compte." };
  }

  await prisma.user.delete({ where: { id: user.id } });
  return { success: true };
}
