import { getSession } from "@/lib/session";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { getCategories } from "@/modules/categories/queries";
import {
  getMonthOccurrences,
  getUpcomingDebits,
} from "@/modules/contracts/calendar";
import { NO_CATEGORY } from "@/modules/categories/model";
import { Box } from "@mui/material";
import AppSidebar, { type SidebarCounts } from "@/components/layout/AppSidebar";
import { CategoriesProvider } from "@/components/contracts/CategoriesProvider";
import EcheancesView, {
  HORIZONS,
  type EcheancesParams,
} from "@/components/echeances/EcheancesView";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

function parseParams(
  raw: Record<string, string | string[] | undefined>,
): EcheancesParams {
  const liste = one(raw.liste);
  const vue = one(raw.vue);
  const horizon = Number(one(raw.horizon));
  return {
    liste: liste === "mois" || liste === "tout" ? liste : "a-venir",
    famille: one(raw.famille) ?? null,
    fournisseur: one(raw.fournisseur) ?? null,
    vue: vue === "calendrier" ? "calendrier" : "liste",
    horizon: (HORIZONS as readonly number[]).includes(horizon) ? horizon : 3,
  };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
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
    if (!params.famille) return true;
    if (params.famille === NO_CATEGORY.slug) return !knownSlugs.has(c.category);
    return c.category === params.famille;
  });

  const today = new Date();
  const counts: SidebarCounts = {
    aVenir: getUpcomingDebits(allContracts, today, params.horizon).length,
    mois: getMonthOccurrences(
      allContracts,
      today.getFullYear(),
      today.getMonth(),
    ).length,
    tout: allContracts.length,
    byCategory: Object.fromEntries(
      categories.map((c) => [
        c.slug,
        allContracts.filter((x) => x.category === c.slug).length,
      ]),
    ),
    orphans: allContracts.filter((c) => !knownSlugs.has(c.category)).length,
    providers,
  };

  return (
    <CategoriesProvider categories={categories}>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AppSidebar
          categories={categories}
          counts={counts}
          active={{
            liste: params.liste,
            famille: params.famille,
            fournisseur: params.fournisseur,
          }}
        />
        <EcheancesView
          contracts={contracts}
          totalContracts={allContracts.length}
          categories={categories}
          params={params}
          todayISO={today.toISOString()}
        />
      </Box>
    </CategoriesProvider>
  );
}
