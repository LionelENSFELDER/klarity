import { Box, Container, Stack, Typography } from "@mui/material";
import { getSession } from "@/lib/session";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { getCategories } from "@/modules/categories/queries";
import { buildSidebarCounts } from "@/modules/contracts/sidebar";
import { getUpcomingDebits } from "@/modules/contracts/calendar";
import {
  getCategoryLoad,
  getDayLoad,
  getMonthlyProjection,
  getRenewals,
  getSmoothedMonthlyCost,
  getTopContracts,
} from "@/modules/contracts/dashboard";
import AppSidebar from "@/components/layout/AppSidebar";
import DashboardView from "@/components/dashboard/DashboardView";

export const dynamic = "force-dynamic";

/** Horizon de la projection : un cycle annuel complet, trimestriels compris. */
const PROJECTION_MONTHS = 12;
const TOP_CONTRACTS = 6;

export default async function TableauDeBordPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
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
  };

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
      <AppSidebar categories={categories} counts={counts} user={session.user} />
      <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, md: 3.5 } }}>
          <Stack sx={{ pt: { xs: 2, md: 3 } }}>
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: { xs: 19, md: 23 },
                letterSpacing: "-0.02em",
              }}
            >
              Tableau de bord
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 12.5, mt: 0.4 }}>
              {contracts.length} contrats actifs · projection sur{" "}
              {PROJECTION_MONTHS} mois
            </Typography>
          </Stack>
          <DashboardView data={data} />
        </Container>
      </Box>
    </Box>
  );
}
