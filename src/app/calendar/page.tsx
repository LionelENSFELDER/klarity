import { getSession } from "@/lib/session";
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
  const session = await getSession();

  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
  }

  const [contracts, activeContracts, totalContracts, contractsStats] =
    await Promise.all([
      getCalendarContracts(),
      prisma.contract.count({
        where: { userId: session.user.id, status: "active" },
      }),
      prisma.contract.count({
        where: { userId: session.user.id },
      }),
      getContratsStats(),
    ]);

  const stats: statsType = {
    activeContracts: activeContracts,
    totalContracts: totalContracts,
    totalAnnual: contractsStats ? contractsStats.totalAnnuel : 0,
  };

  return <CalendarView contracts={contracts} stats={stats} />;
}
