import { cache } from "react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { DEFAULT_CATEGORIES, type Category } from "./model";

/**
 * Catégories de l'utilisateur, créées à la volée au premier accès.
 * Évite une migration de données : tout compte — existant ou nouveau —
 * obtient ses sept catégories par défaut la première fois qu'il les lit.
 */
export const getCategories = cache(async (): Promise<Category[]> => {
  const session = await getSession();
  if (!session?.user?.id) return [];
  return getCategoriesForUser(session.user.id);
});

export async function getCategoriesForUser(userId: string): Promise<Category[]> {
  const existing = await prisma.category.findMany({
    where: { userId },
    orderBy: { position: "asc" },
  });

  if (existing.length > 0) return existing.map(toCategory);

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })),
    skipDuplicates: true,
  });

  const seeded = await prisma.category.findMany({
    where: { userId },
    orderBy: { position: "asc" },
  });
  return seeded.map(toCategory);
}

function toCategory(row: {
  id: string;
  slug: string;
  label: string;
  color: string;
  position: number;
}): Category {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    color: row.color,
    position: row.position,
  };
}
