"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// 🔒 Helpers privés
async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Non autorisé");
  return session.user.id;
}

async function assertIsUserOwnContrat(id: string, userId: string) {
  const contrat = await prisma.contract.findUnique({
    where: { id, userId },
  });
  if (!contrat) throw new Error("Contrat non trouvé");
  return contrat;
}

// 🔧 Helpers de parsing
function parseDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return null;
  return date;
}

function parseAmount(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "string" ? parseFloat(value) : Number(value);
  return isNaN(parsed) ? null : parsed;
}

// ============================================
// Création d'une souscription (vue calendrier)
// ============================================

const subscriptionSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Le fournisseur / nom du contrat est requis"),
    category: z.string().min(1, "La catégorie est requise"),
    amount: z.number().positive("Le montant doit être positif"),
    frequency: z.enum(["once", "monthly", "quarterly", "annual"]),
    debitDay: z.number().int().min(1).max(31).nullable(),
    debitDate: z.string().optional(), // date complète pour "une fois"
    contractNumber: z.string().trim().optional(),
    renewalDate: z.string().optional(),
    iconType: z.string().optional().nullable(),
    iconValue: z.string().optional().nullable(),
  })
  .refine(
    (data) =>
      data.frequency === "once"
        ? Boolean(data.debitDate)
        : data.debitDay !== null,
    {
      message: "Le jour de prélèvement est requis",
      path: ["debitDay"],
    },
  );

export async function CreateSubscription(formData: FormData) {
  const userId = await getSessionUserId();

  // Vérifier que l'utilisateur de la session existe toujours
  // (session obsolète après un reset de la base par exemple)
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return {
      error:
        "Session expirée. Veuillez vous déconnecter puis vous reconnecter.",
    };
  }

  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    amount: parseAmount(formData.get("amount")),
    frequency: formData.get("frequency"),
    debitDay: parseAmount(formData.get("debitDay")),
    debitDate: formData.get("debitDate") ?? undefined,
    contractNumber: formData.get("contractNumber") ?? undefined,
    renewalDate: formData.get("renewalDate") ?? undefined,
    iconType: formData.get("iconType") ?? undefined,
    iconValue: formData.get("iconValue") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const data = parsed.data;

  // "Une fois" : date complète du prélèvement stockée dans startDate
  const debitDate =
    data.frequency === "once" ? parseDate(data.debitDate) : null;
  if (data.frequency === "once" && !debitDate) {
    return { error: "La date du prélèvement est invalide" };
  }
  const debitDay = debitDate ? debitDate.getDate() : (data.debitDay as number);

  // Mois de référence pour les fréquences trimestrielle / annuelle
  const anchorMonth =
    data.frequency === "quarterly" || data.frequency === "annual"
      ? new Date().getMonth()
      : null;

  await prisma.contract.create({
    data: {
      userId,
      name: data.name,
      provider: data.name,
      category: data.category,
      status: "active",
      amount: data.amount,
      frequency: data.frequency,
      debitDay,
      anchorMonth,
      startDate: debitDate,
      contractNumber: data.contractNumber || null,
      renewalDate: parseDate(data.renewalDate),
      monthlyAmount: data.frequency === "monthly" ? data.amount : null,
      annualAmount: data.frequency === "annual" ? data.amount : null,
      iconType: data.iconType || null,
      iconValue: data.iconValue || null,
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

// ============================================
// Édition d'une souscription (vue calendrier)
// ============================================

export async function EditSubscription(id: string, formData: FormData) {
  const userId = await getSessionUserId();
  await assertIsUserOwnContrat(id, userId);

  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    amount: parseAmount(formData.get("amount")),
    frequency: formData.get("frequency"),
    debitDay: parseAmount(formData.get("debitDay")),
    debitDate: formData.get("debitDate") ?? undefined,
    contractNumber: formData.get("contractNumber") ?? undefined,
    renewalDate: formData.get("renewalDate") ?? undefined,
    iconType: formData.get("iconType") ?? undefined,
    iconValue: formData.get("iconValue") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide" };
  }

  const data = parsed.data;

  // "Une fois" : date complète du prélèvement stockée dans startDate
  const debitDate =
    data.frequency === "once" ? parseDate(data.debitDate) : null;
  if (data.frequency === "once" && !debitDate) {
    return { error: "La date du prélèvement est invalide" };
  }
  const debitDay = debitDate ? debitDate.getDate() : (data.debitDay as number);

  // Mois de référence pour les fréquences trimestrielle / annuelle
  const anchorMonth =
    data.frequency === "quarterly" || data.frequency === "annual"
      ? new Date().getMonth()
      : null;

  await prisma.contract.update({
    where: { id },
    data: {
      name: data.name,
      provider: data.name,
      category: data.category,
      amount: data.amount,
      frequency: data.frequency,
      debitDay,
      anchorMonth,
      startDate: debitDate,
      contractNumber: data.contractNumber || null,
      renewalDate: parseDate(data.renewalDate),
      monthlyAmount: data.frequency === "monthly" ? data.amount : null,
      annualAmount: data.frequency === "annual" ? data.amount : null,
      iconType: data.iconType || null,
      iconValue: data.iconValue || null,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}
