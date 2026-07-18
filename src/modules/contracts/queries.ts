import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { CalendarContract } from "./calendar";

/** Contrats actifs formatés pour la vue calendrier. */
export async function getCalendarContracts(): Promise<CalendarContract[]> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const contracts = await prisma.contract.findMany({
    where: { userId: session.user.id, status: "active" },
    orderBy: { amount: "desc" },
  });

  return contracts.map((c) => ({
    id: c.id,
    name: c.name,
    provider: c.provider,
    contractNumber: c.contractNumber,
    category: c.category,
    amount: c.amount || c.monthlyAmount || 0,
    frequency: c.frequency,
    debitDay: c.debitDay,
    anchorMonth: c.anchorMonth,
    renewalDate: c.renewalDate?.toISOString() ?? null,
    documentUrl: c.documentUrl,
    documentName: c.documentName,
  }));
}

export async function getContrats() {
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  return prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContratById(id: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  return prisma.contract.findUnique({
    where: { id, userId: session.user.id },
  });
}

export async function getContratsByStatus(status: string) {
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  return prisma.contract.findMany({
    where: { userId: session.user.id, status },
    orderBy: { createdAt: "desc" },
  });
}

export async function getContratsStats() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const contrats = await prisma.contract.findMany({
    where: { userId: session.user.id, status: "active" },
    select: { monthlyAmount: true, annualAmount: true, status: true },
  });

  const totalMensuel = contrats.reduce(
    (sum, c) => sum + (c.monthlyAmount ?? 0),
    0,
  );

  return {
    totalContrats: contrats.length,
    totalMensuel,
    totalAnnuel: totalMensuel * 12,
  };
}
