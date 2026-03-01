import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth/next";

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
