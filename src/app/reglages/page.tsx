import Link from "next/link";
import { getSession } from "@/lib/session";
import { Box, Button, Container, Stack, Tab, Tabs, Typography } from "@mui/material";
import { getCategories } from "@/modules/categories/queries";
import { getCalendarContracts, getProviders } from "@/modules/contracts/queries";
import { monthlyCost } from "@/modules/contracts/calendar";
import CategorySettings from "@/components/settings/CategorySettings";
import ProviderSettings from "@/components/settings/ProviderSettings";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
  const onglet = (Array.isArray(raw.onglet) ? raw.onglet[0] : raw.onglet) === "fournisseurs"
    ? "fournisseurs"
    : "familles";

  const [categories, contracts, providers] = await Promise.all([
    getCategories(),
    getCalendarContracts(),
    getProviders(),
  ]);

  const usage: Record<string, { count: number; monthlyCost: number }> = {};
  for (const c of contracts) {
    const entry = usage[c.category] ?? { count: 0, monthlyCost: 0 };
    entry.count += 1;
    entry.monthlyCost += monthlyCost(c);
    usage[c.category] = entry;
  }

  return (
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
            Familles et fournisseurs
          </Typography>
        </Box>
        <Button component={Link} href="/calendar" color="inherit" size="small">
          ← Retour aux échéances
        </Button>
      </Stack>

      <Tabs value={onglet} sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tab
          value="familles"
          label="Familles"
          component={Link}
          href="/reglages?onglet=familles"
          sx={{ textTransform: "none" }}
        />
        <Tab
          value="fournisseurs"
          label="Fournisseurs"
          component={Link}
          href="/reglages?onglet=fournisseurs"
          sx={{ textTransform: "none" }}
        />
      </Tabs>

      {onglet === "familles" ? (
        <CategorySettings categories={categories} usage={usage} />
      ) : (
        <ProviderSettings providers={providers} />
      )}
    </Container>
  );
}
