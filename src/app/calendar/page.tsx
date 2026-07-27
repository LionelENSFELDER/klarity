import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCalendarContracts } from "@/modules/contracts/queries";
import CalendarView from "@/components/calendar/CalendarView";
import { prisma } from "@/lib/db";
import { CalendarContract } from "@/modules/contracts/calendar";
import { getContratsStats } from "@modules/contracts/queries";

type statsType = {
  activeContracts?: number;
  totalContracts?: number;
  newConstractsThisMonth?: number;
  recentContracts?: CalendarContract[];
  contractsByCategory?: CalendarContract[];
  totalMonthly?: number;
  totalAnnual?: number;
  budgetTarget?: number;
  budgetProgress?: number;
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
  }

  const contracts = await getCalendarContracts();
  const activeContracts = await prisma.contract.count({
    where: {
      userId: session.user.id,
      status: "active",
    },
  });

  const totalContracts = await prisma.contract.count({
    where: {
      userId: session.user.id,
    },
  });

  const contractsStats = await getContratsStats();

  const stats: statsType = {
    activeContracts: activeContracts,
    totalContracts: totalContracts,
    totalAnnual: contractsStats ? contractsStats.totalAnnuel : 0,
  };

  return <CalendarView contracts={contracts} stats={stats} />;
}
