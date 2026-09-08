import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Description as ContractsIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
} from "@mui/icons-material";
import Link from "next/link";
import Grid from "@mui/material/Grid";

export default async function Home() {
  const session = await getSession();

  // Si l'utilisateur est connecté, rediriger vers le calendrier
  if (session) {
    redirect("/calendar");
  }

  const features = [
    {
      icon: <ContractsIcon sx={{ fontSize: 40 }} />,
      title: "Centralisation des contrats",
      description:
        "Regroupez tous vos contrats en un seul endroit pour une vue d'ensemble complète",
      color: "primary.main",
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: "Suivi des coûts",
      description:
        "Visualisez vos dépenses mensuelles et annuelles en temps réel",
      color: "success.main",
    },
    {
      icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      title: "Gestion simplifiée",
      description:
        "Interface intuitive pour créer, modifier et archiver vos contrats facilement",
      color: "info.main",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Sécurité des données",
      description:
        "Vos données sont protégées avec un système d'authentification sécurisé",
      color: "warning.main",
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: "Alertes intelligentes",
      description:
        "Recevez des notifications avant l'expiration de vos contrats",
      color: "error.main",
    },
    {
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      title: "Tableaux de bord",
      description:
        "Analysez vos données avec des graphiques et statistiques détaillés",
      color: "secondary.main",
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Chip
              label="Alpha v0.1.0"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: 600,
              }}
            />
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{ fontSize: { xs: "2.5rem", md: "3.5rem" } }}
            >
              📋 Klarity
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 700,
                opacity: 0.95,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            >
              Simplifiez la gestion de vos contrats et abonnements avec une
              plateforme intuitive et puissante
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ mt: 4 }}
            >
              <Button
                component={Link}
                href="/auth/register"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "grey.100",
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Commencer gratuitement
              </Button>
              <Button
                component={Link}
                href="/auth/signin"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                  },
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                }}
              >
                Se connecter
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Stack
          spacing={2}
          alignItems="center"
          textAlign="center"
          sx={{ mb: 6 }}
        >
          <Typography variant="h3" fontWeight={700}>
            Fonctionnalités principales
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600 }}
          >
            Tout ce dont vous avez besoin pour gérer efficacement vos contrats
            et abonnements
          </Typography>
        </Stack>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
              <Card
                sx={{
                  height: "100%",
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    sx={{
                      color: feature.color,
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: "primary.main",
          color: "white",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography variant="h4" fontWeight={700}>
              Prêt à simplifier votre gestion administrative ?
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Rejoignez Klarity dès aujourd&apos;hui et prenez le contrôle de
              vos contrats
            </Typography>
            <Button
              component={Link}
              href="/auth/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "grey.100",
                },
                px: 5,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
              }}
            >
              Créer un compte gratuitement
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
