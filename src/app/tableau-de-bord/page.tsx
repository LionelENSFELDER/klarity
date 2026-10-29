import { redirect } from "next/navigation";
import { Box, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getSession } from "@/lib/session";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { getCategories } from "@/modules/categories/queries";
import { buildSidebarCounts } from "@/modules/contracts/sidebar";
import { getUpcomingDebits } from "@/modules/contracts/calendar";
import {
  getCategoryLoad,
  getCategoryProviderFlows,
  getDayLoad,
  getMonthlyProjection,
  getRenewals,
  getSmoothedMonthlyCost,
  getTopContracts,
} from "@/modules/contracts/dashboard";
import AppSidebar from "@/components/layout/AppSidebar";
import DashboardView from "@/components/dashboard/DashboardView";
import AddContractButton from "@/components/contracts/AddContractButton";
import { CategoriesProvider } from "@/components/contracts/CategoriesProvider";

export const dynamic = "force-dynamic";

/** Horizon de la projection : un cycle annuel complet, trimestriels compris. */
const PROJECTION_MONTHS = 12;
const TOP_CONTRACTS = 6;
/** Au-delà, les fournisseurs les plus légers sont regroupés dans le Sankey. */
const SANKEY_PROVIDERS = 8;

export default async function TableauDeBordPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?session=expiree");
  }

  const [contracts, categories, providers] = await Promise.all([
    getCalendarContracts(),
    getCategories(),
    getProviders(),
  ]);

  const today = new Date();
  const counts = buildSidebarCounts(contracts, categories, providers, 3, today);

  // Tout est calculé ici : la vue ne reçoit que des données prêtes à tracer.
  const data = {
    contractCount: contracts.length,
    providerCount: providers.length,
    smoothedMonthly: getSmoothedMonthlyCost(contracts),
    remainingThisMonth: getUpcomingDebits(contracts, today, 1).reduce(
      (sum, o) => sum + o.contract.amount,
      0,
    ),
    month: today.getMonth(),
    projection: getMonthlyProjection(contracts, today, PROJECTION_MONTHS),
    categories: getCategoryLoad(contracts, categories),
    top: getTopContracts(contracts, TOP_CONTRACTS),
    days: getDayLoad(contracts, today.getFullYear(), today.getMonth()),
    renewals: getRenewals(contracts, today),
    categoryList: categories,
    flows: getCategoryProviderFlows(contracts, categories, SANKEY_PROVIDERS),
    today,
  };

  return (
    <CategoriesProvider categories={categories}>
      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <AppSidebar categories={categories} counts={counts} user={session.user} />
        <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          <Box sx={{ px: { xs: 2, md: 3 }, pt: { xs: 1, md: 3 }, maxWidth: 1440 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                {/* Fil d'Ariane : où l'on est et sur quelle période. */}
                <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                  Vue d&apos;ensemble · {contracts.length} contrats actifs · projection sur{" "}
                  {PROJECTION_MONTHS} mois
                </Typography>
                <Typography
                  component="h1"
                  sx={{ fontWeight: 400, fontSize: { xs: 28, md: 32 }, letterSpacing: "-0.02em", mt: 0.25 }}
                >
                  Tableau de bord
                </Typography>
              </Box>
              <AddContractButton
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ minHeight: 48, px: 2.5, fontSize: 15 }}
              >
                Nouveau contrat
              </AddContractButton>
            </Stack>
            <DashboardView data={data} />
          </Box>
        </Box>
      </Box>
    </CategoriesProvider>
  );
}
