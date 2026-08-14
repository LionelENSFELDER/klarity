"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { ContractFormData } from "./types";

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

export async function CreateContract(input: ContractFormData) {
  const userId = await getSessionUserId();

  await prisma.contract.create({
    data: {
      userId,
      name: input.name,
      provider: input.provider ?? "",
      contractNumber: input.contractNumber,
      category: input.category,
      status: input.status ?? "active",
      startDate: input.startDate || null,
      endDate: input.endDate || null,
      renewalDate: input.renewalDate || null,
      monthlyAmount: parseAmount(input.monthlyAmount),
      annualAmount: parseAmount(input.annualAmount),
      clientPhone: input.clientPhone,
      website: input.website,
      advisorName: input.advisorName,
      notes: input.notes,
      iconType: input.iconType || null,
      iconValue: input.iconValue || null,
    },
  });

  revalidatePath("/contracts");
}

export async function EditContract(id: string, input: ContractFormData) {
  const userId = await getSessionUserId();
  await assertIsUserOwnContrat(id, userId);

  await prisma.contract.update({
    where: { id },
    data: {
      name: input.name,
      provider: input.provider,
      contractNumber: input.contractNumber,
      category: input.category,
      status: input.status,
      startDate: input.startDate || undefined,
      endDate: input.endDate || undefined,
      renewalDate: input.renewalDate || undefined,
      monthlyAmount: parseAmount(input.monthlyAmount),
      annualAmount: parseAmount(input.annualAmount),
      clientPhone: input.clientPhone,
      website: input.website,
      advisorName: input.advisorName,
      notes: input.notes,
      updatedAt: new Date(),
      iconType: input.iconType || null,
      iconValue: input.iconValue || null,
    },
  });

  revalidatePath("/contracts");
  revalidatePath(`/contracts/${id}`);
}

export async function ArchiveContract(id: string) {
  const userId = await getSessionUserId();
  await assertIsUserOwnContrat(id, userId);

  await prisma.contract.update({
    where: { id },
    data: { status: "archived", updatedAt: new Date() },
  });

  revalidatePath("/contracts");
}

export async function DeleteContract(id: string) {
  const userId = await getSessionUserId();
  await assertIsUserOwnContrat(id, userId);
  await prisma.contract.delete({ where: { id } });
  revalidatePath("/contracts");
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

const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 Mo

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

  // Document PDF optionnel
  let documentUrl: string | null = null;
  let documentName: string | null = null;
  const file = formData.get("document");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { error: "Le document doit être un PDF" };
    }
    if (file.size > MAX_DOCUMENT_SIZE) {
      return { error: "Le document ne doit pas dépasser 10 Mo" };
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const dir = path.join(process.cwd(), "public", "uploads", userId);
    await fs.mkdir(dir, { recursive: true });
    const filename = `${crypto.randomUUID()}.pdf`;
    await fs.writeFile(path.join(dir, filename), buffer);
    documentUrl = `/uploads/${userId}/${filename}`;
    documentName = file.name;
  }

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
      documentUrl,
      documentName,
      monthlyAmount: data.frequency === "monthly" ? data.amount : null,
      annualAmount: data.frequency === "annual" ? data.amount : null,
      iconType: data.iconType || null,
      iconValue: data.iconValue || null,
    },
  });

  revalidatePath("/calendar");
  revalidatePath("/contracts");
  return { success: true };
}
