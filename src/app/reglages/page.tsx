import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { getCategories } from "@/modules/categories/queries";
import {
  getAllContracts,
  getCalendarContracts,
  getProviders,
} from "@/modules/contracts/queries";
import { monthlyCost } from "@/modules/contracts/calendar";
import { buildSidebarCounts } from "@/modules/contracts/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import CategorySettings from "@/components/settings/CategorySettings";
import ProviderSettings from "@/components/settings/ProviderSettings";
import ContractSettings from "@/components/settings/ContractSettings";
import AccountSettings from "@/components/settings/AccountSettings";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ONGLETS = [
  { id: "contrats", label: "Contrats" },
  { id: "categories", label: "Catégories" },
  { id: "fournisseurs", label: "Fournisseurs" },
  { id: "compte", label: "Compte" },
] as const;

type Onglet = (typeof ONGLETS)[number]["id"];

export default async function ReglagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin?session=expiree");
  }

  const raw = await searchParams;
  const asked = Array.isArray(raw.onglet) ? raw.onglet[0] : raw.onglet;
  const onglet: Onglet = ONGLETS.some((o) => o.id === asked)
    ? (asked as Onglet)
    : "contrats";

  const [categories, contracts, allContracts, providers] = await Promise.all([
    getCategories(),
    getCalendarContracts(),
    getAllContracts(),
    getProviders(),
  ]);

  const usage: Record<string, { count: number; monthlyCost: number }> = {};
  for (const c of contracts) {
    const entry = usage[c.category] ?? { count: 0, monthlyCost: 0 };
    entry.count += 1;
    entry.monthlyCost += monthlyCost(c);
    usage[c.category] = entry;
  }

  const counts = buildSidebarCounts(contracts, categories, providers, 3, new Date());
  const tabCounts: Record<Onglet, number | null> = {
    contrats: allContracts.length,
    categories: categories.length,
    fournisseurs: providers.length,
    compte: null,
  };

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
      <AppSidebar
        categories={categories}
        counts={counts}
        user={session.user}
      />
      <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Box sx={{ px: { xs: 2, md: 4 }, pt: { xs: 2, md: 3.5 }, pb: 5, maxWidth: 1200 }}>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Contrats, catégories, fournisseurs et compte
          </Typography>
          <Typography
            component="h1"
            sx={{ fontWeight: 700, fontSize: { xs: 22, md: 28 }, letterSpacing: "-0.02em", mt: 0.5 }}
          >
            Réglages
          </Typography>

          <Tabs
            value={onglet}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ borderBottom: 1, borderColor: "divider", mt: 2, mb: 2.5 }}
          >
            {ONGLETS.map((o) => (
              <Tab
                key={o.id}
                value={o.id}
                label={
                  <span>
                    {o.label}{" "}
                    {tabCounts[o.id] !== null && (
                      <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
                        {tabCounts[o.id]}
                      </Box>
                    )}
                  </span>
                }
                component={Link}
                href={`/reglages?onglet=${o.id}`}
                sx={{ textTransform: "none", fontWeight: 600, fontSize: 14 }}
              />
            ))}
          </Tabs>

          {onglet === "contrats" && (
            <ContractSettings contracts={allContracts} categories={categories} />
          )}
          {onglet === "categories" && (
            <CategorySettings categories={categories} usage={usage} />
          )}
          {onglet === "fournisseurs" && (
            <ProviderSettings providers={providers} />
          )}
          {onglet === "compte" && (
            <AccountSettings email={session.user.email ?? ""} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
