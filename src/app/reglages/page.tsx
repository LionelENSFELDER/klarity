import Link from "next/link";
import { getSession } from "@/lib/session";
import { Box, Button, Container, Stack, Tab, Tabs, Typography } from "@mui/material";
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

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const ONGLETS = [
  { id: "contrats", label: "Contrats" },
  { id: "categories", label: "Catégories" },
  { id: "fournisseurs", label: "Fournisseurs" },
] as const;

type Onglet = (typeof ONGLETS)[number]["id"];

export default async function ReglagesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
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

  return (
    <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
      <AppSidebar
        categories={categories}
        counts={counts}
        user={session.user}
      />
      <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 23,
                  letterSpacing: "-0.02em",
                }}
              >
                Réglages
              </Typography>
              <Typography sx={{ color: "text.secondary", fontSize: 12.5, mt: 0.4 }}>
                Contrats, catégories et fournisseurs
              </Typography>
            </Box>
            <Button component={Link} href="/calendar" color="inherit" size="small">
              ← Retour aux échéances
            </Button>
          </Stack>

          <Tabs value={onglet} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            {ONGLETS.map((o) => (
              <Tab
                key={o.id}
                value={o.id}
                label={o.label}
                component={Link}
                href={`/reglages?onglet=${o.id}`}
                sx={{ textTransform: "none" }}
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
        </Container>
      </Box>
    </Box>
  );
}
