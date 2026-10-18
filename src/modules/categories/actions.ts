"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CATEGORY_PALETTE, NO_CATEGORY, normalizeName, slugify } from "./model";

type Result = { success: true } | { error: string };

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user.id;
}

function revalidate() {
  revalidatePath("/calendar");
  revalidatePath("/reglages");
}

export async function CreateCategory(label: string): Promise<Result> {
  const userId = await getSessionUserId();
  const trimmed = label.trim();
  if (!trimmed) return { error: "Le nom ne peut pas être vide." };

  const existing = await prisma.category.findMany({ where: { userId } });
  if (existing.some((c) => normalizeName(c.label) === normalizeName(trimmed))) {
    return { error: `« ${trimmed} » existe déjà.` };
  }

  await prisma.category.create({
    data: {
      userId,
      label: trimmed,
      slug: slugify(trimmed, existing.map((c) => c.slug)),
      color: CATEGORY_PALETTE[existing.length % CATEGORY_PALETTE.length],
      position: existing.length,
    },
  });

  revalidate();
  return { success: true };
}

export async function RenameCategory(id: string, label: string): Promise<Result> {
  const userId = await getSessionUserId();
  const trimmed = label.trim();
  if (!trimmed) return { error: "Le nom ne peut pas être vide." };

  const siblings = await prisma.category.findMany({ where: { userId } });
  if (!siblings.some((c) => c.id === id)) return { error: "Famille introuvable." };
  if (
    siblings.some(
      (c) => c.id !== id && normalizeName(c.label) === normalizeName(trimmed),
    )
  ) {
    return { error: `« ${trimmed} » existe déjà.` };
  }

  // Le slug n'est pas recalculé : les contrats y font référence.
  await prisma.category.update({ where: { id }, data: { label: trimmed } });
  revalidate();
  return { success: true };
}

export async function RecolorCategory(id: string, color: string): Promise<Result> {
  const userId = await getSessionUserId();
  if (!/^#[0-9a-f]{6}$/i.test(color)) return { error: "Couleur invalide." };

  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) return { error: "Famille introuvable." };

  await prisma.category.update({ where: { id }, data: { color } });
  revalidate();
  return { success: true };
}

/**
 * Supprime une famille. `reassignTo` est le slug de destination des contrats
 * concernés, ou NO_CATEGORY.slug pour les laisser sans famille.
 */
export async function DeleteCategory(
  id: string,
  reassignTo: string,
): Promise<Result> {
  const userId = await getSessionUserId();

  const category = await prisma.category.findFirst({ where: { id, userId } });
  if (!category) return { error: "Famille introuvable." };

  const used = await prisma.contract.count({
    where: { userId, category: category.slug },
  });

  if (used > 0) {
    if (!reassignTo) {
      return {
        error: `${used} contrat${used > 1 ? "s utilisent" : " utilise"} cette famille : choisis une destination.`,
      };
    }
    if (reassignTo !== NO_CATEGORY.slug) {
      const target = await prisma.category.findFirst({
        where: { userId, slug: reassignTo },
      });
      if (!target) return { error: "Famille de destination introuvable." };
    }
    await prisma.contract.updateMany({
      where: { userId, category: category.slug },
      data: { category: reassignTo },
    });
  }

  await prisma.category.delete({ where: { id } });
  revalidate();
  return { success: true };
}

// ============================================
// Fournisseurs — dérivés des contrats, pas une table
// ============================================

export async function RenameProvider(
  from: string,
  to: string,
): Promise<Result> {
  const userId = await getSessionUserId();
  const trimmed = to.trim();
  if (!trimmed) return { error: "Le nom du fournisseur ne peut pas être vide." };

  // Renommer vers une variante d'un fournisseur existant revient à fusionner.
  const others = await prisma.contract.findMany({
    where: { userId, provider: { not: from } },
    select: { provider: true },
    distinct: ["provider"],
  });
  const clash = others.find(
    (c) => normalizeName(c.provider) === normalizeName(trimmed),
  );

  await prisma.contract.updateMany({
    where: { userId, provider: from },
    data: { provider: clash ? clash.provider : trimmed },
  });

  revalidate();
  return { success: true };
}

export async function MergeProviders(
  from: string,
  into: string,
): Promise<Result> {
  const userId = await getSessionUserId();
  if (!into.trim()) return { error: "Choisis un fournisseur de destination." };
  if (from === into) return { error: "Les deux fournisseurs sont identiques." };

  await prisma.contract.updateMany({
    where: { userId, provider: from },
    data: { provider: into },
  });

  revalidate();
  return { success: true };
}
