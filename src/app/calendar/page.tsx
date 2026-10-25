import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { getMonthTotal, getUpcomingDebits } from "@/modules/contracts/calendar";
import {
  getCategoryLoad,
  getRenewals,
  getSmoothedMonthlyCost,
} from "@/modules/contracts/dashboard";
import { getCategories } from "@/modules/categories/queries";
import { NO_CATEGORY } from "@/modules/categories/model";
import { Box } from "@mui/material";
import AppSidebar from "@/components/layout/AppSidebar";
import { buildSidebarCounts } from "@/modules/contracts/sidebar";
import { CategoriesProvider } from "@/components/contracts/CategoriesProvider";
import EcheancesView from "@/components/echeances/EcheancesView";
import { parseParams } from "@/components/echeances/params";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?session=expiree");
  }

  const params = parseParams(await searchParams);

  const [allContracts, categories, providers] = await Promise.all([
    getCalendarContracts(),
    getCategories(),
    getProviders(),
  ]);

  const knownSlugs = new Set(categories.map((c) => c.slug));

  // Le filtrage se fait ici : la vue reçoit une liste déjà réduite.
  const contracts = allContracts.filter((c) => {
    if (params.fournisseur && c.provider !== params.fournisseur) return false;
    if (!params.categorie) return true;
    if (params.categorie === NO_CATEGORY.slug) return !knownSlugs.has(c.category);
    return c.category === params.categorie;
  });

  const today = new Date();
  const counts = buildSidebarCounts(
    allContracts,
    categories,
    providers,
    params.horizon,
    today,
  );

  // Le résumé porte sur tout le portefeuille, quel que soit le filtre affiché.
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const remaining = getUpcomingDebits(allContracts, today, 1);
  const soon = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 90);
  const renewals = getRenewals(allContracts, today).filter((r) => !r.overdue);
  const summary = {
    remainingThisMonth: remaining.reduce((sum, o) => sum + o.contract.amount, 0),
    remainingCount: remaining.length,
    nextMonthTotal: getMonthTotal(allContracts, nextMonth.getFullYear(), nextMonth.getMonth()),
    smoothedMonthly: getSmoothedMonthlyCost(allContracts),
    contractCount: allContracts.length,
    renewalsSoon: renewals.filter((r) => r.date <= soon).length,
    next: getUpcomingDebits(allContracts, today, 12)[0] ?? null,
    renewals: renewals.slice(0, 3),
    categories: getCategoryLoad(allContracts, categories),
  };

  return (
    <CategoriesProvider categories={categories}>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AppSidebar
          categories={categories}
          counts={counts}
          user={session.user}
        />
        <EcheancesView
          contracts={contracts}
          totalContracts={allContracts.length}
          categories={categories}
          params={params}
          summary={summary}
          todayISO={today.toISOString()}
        />
      </Box>
    </CategoriesProvider>
  );
}
