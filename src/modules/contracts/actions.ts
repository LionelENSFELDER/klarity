"use server";

import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
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

function ValidateContract(input: ContractFormData) {
  if (!input.name?.trim()) throw new Error("Le nom est requis");
  if (!input.provider?.trim()) throw new Error("Le fournisseur est requis");
  if (!input.category) throw new Error("La catégorie est requise");
  if (!input.startDate || !parseDate(input.startDate))
    throw new Error("La date de début est requise et doit être valide");
}

// ✅ Actions publiques
export async function CreateContract(input: ContractFormData) {
  const userId = await getSessionUserId();
  ValidateContract(input);

  await prisma.contract.create({
    data: {
      userId,
      name: input.name,
      provider: input.provider ?? "",
      contractNumber: input.contractNumber,
      category: input.category,
      status: input.status ?? "active",
      startDate: parseDate(input.startDate)!,
      endDate: parseDate(input.endDate),
      renewalDate: parseDate(input.renewalDate),
      monthlyAmount: parseAmount(input.monthlyAmount),
      annualAmount: parseAmount(input.annualAmount),
      clientPhone: input.clientPhone,
      website: input.website,
      advisorName: input.advisorName,
      notes: input.notes,
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
      startDate: parseDate(input.startDate) ?? undefined,
      endDate: parseDate(input.endDate) ?? undefined,
      renewalDate: parseDate(input.renewalDate) ?? undefined,
      monthlyAmount: parseAmount(input.monthlyAmount),
      annualAmount: parseAmount(input.annualAmount),
      clientPhone: input.clientPhone,
      website: input.website,
      advisorName: input.advisorName,
      notes: input.notes,
      updatedAt: new Date(),
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
