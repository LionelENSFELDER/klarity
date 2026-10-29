import { cache } from "react";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { monthlyCost, type CalendarContract } from "./calendar";

/**
 * Contrats actifs formatés pour la vue calendrier.
 * `cache` dédoublonne l'appel dans une même requête : le header et la page
 * ont tous deux besoin de cette liste.
 */
export const getCalendarContracts = cache(async (): Promise<CalendarContract[]> => {
  const session = await getSession();
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
    startDate: c.startDate?.toISOString() ?? null,
    renewalDate: c.renewalDate?.toISOString() ?? null,
  }));
});

/**
 * Fournisseurs de l'utilisateur, triés par coût mensuel décroissant.
 * La liste se déduit des contrats : un fournisseur sans contrat n'existe pas.
 */
export const getProviders = cache(async (): Promise<
  { name: string; count: number; monthlyCost: number }[]
> => {
  const contracts = await getCalendarContracts();
  const byName = new Map<string, { count: number; monthlyCost: number }>();

  for (const c of contracts) {
    const entry = byName.get(c.provider) ?? { count: 0, monthlyCost: 0 };
    entry.count += 1;
    entry.monthlyCost += monthlyCost(c);
    byName.set(c.provider, entry);
  }

  return [...byName.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.monthlyCost - a.monthlyCost || a.name.localeCompare(b.name, "fr"));
});

export async function getContratsStats() {
  const session = await getSession();
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

/**
 * Contrat enrichi pour la page de gestion : le statut et la date de création
 * ne servent qu'ici, la vue calendrier n'en a pas besoin.
 */
export interface ManagedContract extends CalendarContract {
  status: string;
  createdAt: string;
}

/**
 * Tous les contrats, archivés compris.
 *
 * Les autres requêtes filtrent sur `status: "active"` : sans celle-ci, un
 * contrat archivé devient définitivement invisible et impossible à restaurer.
 */
export async function getAllContracts(): Promise<ManagedContract[]> {
  const session = await getSession();
  if (!session?.user?.id) return [];

  const contracts = await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { amount: "desc" }],
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
    startDate: c.startDate?.toISOString() ?? null,
    renewalDate: c.renewalDate?.toISOString() ?? null,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));
}
