"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { resolveAnchorMonth } from "./calendar";

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

const TEXT_MAX = 100;
const TOO_LONG = `${TEXT_MAX} caractères maximum`;

const subscriptionSchema = z
  .object({
    // Bornes de longueur : un champ texte sans limite permet de remplir la base.
    name: z.string().trim().min(1, "Le nom du contrat est requis").max(TEXT_MAX, TOO_LONG),
    provider: z.string().trim().max(TEXT_MAX, TOO_LONG).optional(),
    category: z.string().min(1, "La catégorie est requise").max(64),
    amount: z.number().positive("Le montant doit être positif").max(1_000_000, "Le montant est trop élevé"),
    frequency: z.enum(["once", "monthly", "quarterly", "annual"]),
    debitDay: z.number().int().min(1).max(31).nullable(),
    // Mois de référence (0-11) d'un trimestriel ou d'un annuel.
    anchorMonth: z
      .number()
      .int()
      .min(0, "Le mois de référence est invalide")
      .max(11, "Le mois de référence est invalide")
      .nullable(),
    debitDate: z.string().max(32).optional(), // date complète pour "une fois"
    contractNumber: z.string().trim().max(TEXT_MAX, TOO_LONG).optional(),
    renewalDate: z.string().max(32).optional(),
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
    provider: formData.get("provider") ?? undefined,
    category: formData.get("category"),
    amount: parseAmount(formData.get("amount")),
    frequency: formData.get("frequency"),
    debitDay: parseAmount(formData.get("debitDay")),
    anchorMonth: parseAmount(formData.get("anchorMonth")),
    debitDate: formData.get("debitDate") ?? undefined,
    contractNumber: formData.get("contractNumber") ?? undefined,
    renewalDate: formData.get("renewalDate") ?? undefined,
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

  const anchorMonth = resolveAnchorMonth(data.frequency, data.anchorMonth, new Date());

  await prisma.contract.create({
    data: {
      userId,
      name: data.name,
      provider: data.provider || data.name,
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
  const existing = await assertIsUserOwnContrat(id, userId);

  const parsed = subscriptionSchema.safeParse({
    name: formData.get("name"),
    provider: formData.get("provider") ?? undefined,
    category: formData.get("category"),
    amount: parseAmount(formData.get("amount")),
    frequency: formData.get("frequency"),
    debitDay: parseAmount(formData.get("debitDay")),
    anchorMonth: parseAmount(formData.get("anchorMonth")),
    debitDate: formData.get("debitDate") ?? undefined,
    contractNumber: formData.get("contractNumber") ?? undefined,
    renewalDate: formData.get("renewalDate") ?? undefined,
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

  // Le mois saisi l'emporte ; sans saisie, le contrat garde le sien.
  const anchorMonth = resolveAnchorMonth(
    data.frequency,
    data.anchorMonth ?? existing.anchorMonth,
    new Date(),
  );

  await prisma.contract.update({
    where: { id },
    data: {
      name: data.name,
      provider: data.provider || data.name,
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
      updatedAt: new Date(),
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

// ============================================
// Gestion des contrats (page Réglages)
// ============================================

type Result = { success: true } | { error: string };

/**
 * Archive ou réactive un contrat.
 *
 * Un contrat archivé disparaît des échéances et du calendrier — toutes les
 * requêtes d'affichage filtrent sur `status: "active"` — mais reste
 * consultable et restaurable depuis la page de gestion.
 */
export async function SetContractArchived(
  id: string,
  archived: boolean,
): Promise<Result> {
  const userId = await getSessionUserId();
  const contract = await prisma.contract.findFirst({ where: { id, userId } });
  if (!contract) return { error: "Contrat non trouvé." };

  await prisma.contract.update({
    where: { id },
    data: { status: archived ? "archived" : "active", updatedAt: new Date() },
  });

  revalidatePath("/calendar");
  revalidatePath("/reglages");
  return { success: true };
}

/** Supprime définitivement un contrat. Irréversible. */
export async function DeleteContract(id: string): Promise<Result> {
  const userId = await getSessionUserId();
  const contract = await prisma.contract.findFirst({ where: { id, userId } });
  if (!contract) return { error: "Contrat non trouvé." };

  await prisma.contract.delete({ where: { id } });

  revalidatePath("/calendar");
  revalidatePath("/reglages");
  return { success: true };
}
