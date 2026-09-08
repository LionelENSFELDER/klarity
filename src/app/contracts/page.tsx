import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  FileUpload as FileUploadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import ContractsView from "@/components/contracts/ContractsView";
import AddContractButton from "@/components/contracts/AddContractButton";

export default async function ContractsPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Récupérer tous les contrats de l'utilisateur
  const contracts = await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Statistiques par statut
  const statsCount = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    pending: contracts.filter((c) => c.status === "pending").length,
    expired: contracts.filter((c) => c.status === "expired").length,
    archived: contracts.filter((c) => c.status === "archived").length,
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={700}
            sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
          >
            <span style={{ marginRight: 12 }}>📄</span>
            Mes Contrats
          </Typography>
          <Typography color="text.secondary">
            Gérez tous vos contrats en un seul endroit
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<FileUploadIcon />}>
            Importer
          </Button>
          <AddContractButton variant="contained" startIcon={<AddIcon />}>
            Nouveau contrat
          </AddContractButton>
        </Stack>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Total
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {statsCount.total}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "primary.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h5">📊</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Actifs
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    {statsCount.active}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "success.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h5">✅</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    En attente
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="warning.main"
                  >
                    {statsCount.pending}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "warning.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h5">⏳</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={6}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Expirés
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="error.main">
                    {statsCount.expired}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: "error.light",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="h5">⚠️</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contracts View */}
      <ContractsView contracts={contracts} />
    </Container>
  );
}
