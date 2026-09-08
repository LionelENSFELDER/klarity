import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  AlertTitle,
  Paper,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Celebration as CelebrationIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import Link from "next/link";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import StatsCard from "@/components/dashboard/StatsCard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
  }

  // Récupérer les stats utilisateur
  const stats = await prisma.contract.aggregate({
    where: { userId: session.user.id },
    _sum: {
      monthlyAmount: true,
      annualAmount: true,
    },
    _count: {
      id: true,
    },
  });

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

  const newConstratsThisMonth = await prisma.contract.count({
    where: {
      userId: session.user.id,
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      },
    },
  });

  // Récupérer les contrats récents
  const recentContracts = await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculer les contrats par catégorie
  const contractsByCategory = await prisma.contract.groupBy({
    by: ["category"],
    where: { userId: session.user.id },
    _count: {
      id: true,
    },
  });

  const totalMonthly = stats._sum.monthlyAmount || 0;
  const totalAnnual = stats._sum.annualAmount || 0;
  const budgetTarget = 1000; // Budget cible mensuel
  const budgetProgress = Math.min((totalMonthly / budgetTarget) * 100, 100);

  return (
    <MuiThemeProvider>
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="xl">
          {/* Welcome Header */}
          <Box sx={{ mb: 6 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
                >
                  Bonjour, {session.user.name?.split(" ")[0]} ! 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Voici un aperçu de vos contrats et finances
                </Typography>
              </Box>
              <Link href="/contracts" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  size="large"
                  sx={{ boxShadow: 2 }}
                >
                  Ajouter un contrat
                </Button>
              </Link>
            </Stack>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3}>
            <Grid size={3} mb={4}>
              <StatsCard
                title="Contrats actifs"
                icon="DescriptionIcon"
                line1={activeContracts}
              />
            </Grid>

            <Grid size={3}>
              <StatsCard
                title="Coût mensuel"
                icon="TrendingUpIcon"
                line1={totalMonthly.toFixed(2) + " €"}
              />
            </Grid>

            <Grid size={3}>
              <StatsCard
                title="Coût annuel"
                icon="AssessmentIcon"
                line1={totalAnnual.toFixed(2) + " €"}
              />
            </Grid>

            <Grid size={3}>
              <StatsCard title="Alertes" icon="WarningIcon" line1="3" />
            </Grid>
          </Grid>

          {/* Main Content Tabs */}
          <DashboardTabs
            overviewContent={
              <Grid container spacing={3}>
                {/* Welcome Message */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card>
                    <CardContent>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        mb={2}
                      >
                        <CelebrationIcon color="primary" />
                        <Typography variant="h5" fontWeight={600}>
                          Bienvenue sur Klarity !
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Votre plateforme de gestion administrative est
                        configurée
                      </Typography>

                      {stats._count.id > 0 ? (
                        <Alert severity="success" sx={{ mb: 3 }}>
                          <AlertTitle>
                            Données chargées avec succès !
                          </AlertTitle>
                          Vous avez {stats._count.id} contrats dans votre base
                          de données. Explorez vos contrats, ajoutez-en de
                          nouveaux et suivez vos échéances.
                        </Alert>
                      ) : (
                        <Alert severity="info" sx={{ mb: 3 }}>
                          <AlertTitle>Commencez votre gestion !</AlertTitle>
                          Lancez <code>npm run db:seed</code> pour charger des
                          données de test.
                        </Alert>
                      )}

                      <Typography variant="subtitle2" mb={2} fontWeight={600}>
                        Actions rapides :
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<DescriptionIcon />}
                            sx={{ justifyContent: "flex-start" }}
                          >
                            Nouveau contrat
                          </Button>
                        </Grid>
                        <Grid size={6}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<AssessmentIcon />}
                            sx={{ justifyContent: "flex-start" }}
                          >
                            Voir analytics
                          </Button>
                        </Grid>
                        <Grid size={6}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<NotificationsIcon />}
                            sx={{ justifyContent: "flex-start" }}
                          >
                            Alertes (3)
                          </Button>
                        </Grid>
                        <Grid size={6}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<SettingsIcon />}
                            sx={{ justifyContent: "flex-start" }}
                          >
                            Paramètres
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Budget Overview */}
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Card>
                    <CardContent>
                      <Typography variant="h5" fontWeight={600} mb={1}>
                        Budget mensuel
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={3}>
                        Suivi de vos dépenses contractuelles
                      </Typography>

                      <Stack spacing={1} mb={2}>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">
                            Dépensé ce mois
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {totalMonthly.toFixed(2)}€
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={budgetProgress}
                          sx={{ height: 8, borderRadius: 1 }}
                        />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            0€
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Objectif: {budgetTarget}€
                          </Typography>
                        </Stack>
                      </Stack>

                      <Divider sx={{ my: 3 }} />

                      <Typography variant="subtitle2" fontWeight={600} mb={2}>
                        Répartition par catégorie :
                      </Typography>
                      <Stack spacing={2}>
                        {contractsByCategory.map((category) => (
                          <Stack
                            key={category.category}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1.5}
                            >
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  bgcolor: "primary.main",
                                  borderRadius: "50%",
                                }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ textTransform: "capitalize" }}
                              >
                                {category.category.replace(/-/g, " ")}
                              </Typography>
                            </Stack>
                            <Chip
                              label={category._count.id}
                              size="small"
                              variant="outlined"
                            />
                          </Stack>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            }
            contractsContent={
              <Card>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} mb={1}>
                    Contrats récents
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Vos 5 derniers contrats ajoutés
                  </Typography>
                  <Stack spacing={2}>
                    {recentContracts.map((contract) => (
                      <Paper key={contract.id} variant="outlined" sx={{ p: 2 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                bgcolor: "primary.dark",
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <DescriptionIcon
                                sx={{ color: "primary.light" }}
                              />
                            </Box>
                            <Box>
                              <Typography variant="body1" fontWeight={600}>
                                {contract.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {contract.provider}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box textAlign="right">
                              <Typography variant="body1" fontWeight={600}>
                                {contract.monthlyAmount?.toFixed(2) || "N/A"}€
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                par mois
                              </Typography>
                            </Box>
                            <Chip
                              label={contract.status}
                              color={
                                contract.status === "active"
                                  ? "success"
                                  : "default"
                              }
                              size="small"
                            />
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            }
            analyticsContent={
              <Card>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} mb={1}>
                    Analytics détaillées
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Analyse de vos dépenses et contrats (Fonctionnalité à venir)
                  </Typography>
                  <Box textAlign="center" py={8}>
                    <AssessmentIcon
                      sx={{ fontSize: 80, color: "text.secondary", mb: 3 }}
                    />
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      Analytics en développement
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cette section contiendra des graphiques et analyses
                      détaillées
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            }
            alertsContent={
              <Card>
                <CardContent>
                  <Typography variant="h5" fontWeight={600} mb={1}>
                    Alertes et notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Gérez vos rappels et notifications importantes
                  </Typography>
                  <Stack spacing={2}>
                    <Alert severity="warning">
                      <AlertTitle>3 renouvellements approchent</AlertTitle>
                      Vérifiez vos contrats arrivant à échéance ce mois.
                    </Alert>
                    <Alert severity="info">
                      <AlertTitle>Nouveau contrat ajouté</AlertTitle>
                      Votre contrat &quot;Assurance Auto&quot; a été créé avec
                      succès.
                    </Alert>
                  </Stack>
                </CardContent>
              </Card>
            }
          />
        </Container>
      </Box>
    </MuiThemeProvider>
  );
}
