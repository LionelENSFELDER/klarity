"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem as MenuItemMui,
  Divider,
  Tabs,
  Tab,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { MoreVert as MoreVertIcon } from "@mui/icons-material";
import type { Contract } from "@/modules/contracts/types";
import { DeleteContract } from "@/modules/contracts/actions";
import AddContractButton from "@/components/contracts/AddContractButton";

// interface Contract {
//   id: string;
//   name: string;
//   provider: string;
//   category: string;
//   status: string;
//   monthlyAmount: number | null;
//   annualAmount: number | null;
//   startDate: Date | null;
//   endDate: Date | null;
//   createdAt: Date;
//   updatedAt: Date;
// }

interface ContractsViewProps {
  contracts: Contract[];
}

export default function ContractsView({ contracts }: ContractsViewProps) {
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null,
  );

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    contractId: string,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedContractId(contractId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedContractId(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "success" as const, label: "Actif" },
      pending: { color: "warning" as const, label: "En attente" },
      expired: { color: "error" as const, label: "Expiré" },
      archived: { color: "default" as const, label: "Archivé" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      subscription: "💳",
      insurance: "🛡️",
      utilities: "⚡",
      telecommunications: "📱",
      software: "💻",
      entertainment: "🎬",
      finance: "🏦",
      other: "📄",
    };
    return icons[category] || "📄";
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return `${amount.toFixed(2)}€`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <Box>
      {/* Filters & Search */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Filtres et recherche" />
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              placeholder="🔍 Rechercher un contrat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 } }}>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Catégorie"
              >
                <MenuItem value="all">Toutes les catégories</MenuItem>
                <MenuItem value="subscription">Abonnements</MenuItem>
                <MenuItem value="insurance">Assurances</MenuItem>
                <MenuItem value="utilities">Services publics</MenuItem>
                <MenuItem value="telecommunications">
                  Télécommunications
                </MenuItem>
                <MenuItem value="software">Logiciels</MenuItem>
                <MenuItem value="entertainment">Divertissement</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
                <MenuItem value="other">Autre</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 150 } }}>
              <InputLabel>Statut</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Statut"
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="expired">Expiré</MenuItem>
                <MenuItem value="archived">Archivé</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
        >
          <Tab label="Vue tableau" />
          <Tab label="Vue cartes" />
        </Tabs>
      </Box>

      {/* Table View */}
      {tabValue === 0 && (
        <Card>
          <CardHeader
            title="Liste des contrats"
            subheader={`${contracts.length} contrat${
              contracts.length > 1 ? "s" : ""
            } au total`}
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Contrat</TableCell>
                    <TableCell>Fournisseur</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell>Coût mensuel</TableCell>
                    <TableCell>Coût annuel</TableCell>
                    <TableCell>Date fin</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {contracts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Typography variant="h3" sx={{ mb: 2 }}>
                            📄
                          </Typography>
                          <Typography color="text.secondary" sx={{ mb: 2 }}>
                            Aucun contrat trouvé
                          </Typography>
                          <AddContractButton variant="outlined" size="small">
                            Créer votre premier contrat
                          </AddContractButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contracts.map((contract) => (
                      <TableRow key={contract.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Typography sx={{ mr: 1 }}>
                              {getCategoryIcon(contract.category)}
                            </Typography>
                            <Typography fontWeight={500}>
                              {contract.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{contract.provider}</TableCell>
                        <TableCell sx={{ textTransform: "capitalize" }}>
                          {contract.category.replace(/-/g, " ")}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(contract.monthlyAmount)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(contract.annualAmount)}
                        </TableCell>
                        <TableCell>{formatDate(contract.endDate)}</TableCell>
                        <TableCell>{getStatusBadge(contract.status)}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, contract.id)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Card View */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          {contracts.length === 0 ? (
            <Grid size={12}>
              <Box sx={{ textAlign: "center", py: 12 }}>
                <Typography variant="h2" sx={{ mb: 2 }}>
                  📄
                </Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Aucun contrat
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Commencez par créer votre premier contrat
                </Typography>
                <AddContractButton variant="contained" startIcon={<span>+</span>}>
                  Nouveau contrat
                </AddContractButton>
              </Box>
            </Grid>
          ) : (
            contracts.map((contract) => (
              <Grid size={12} key={contract.id}>
                <Card
                  sx={{ "&:hover": { boxShadow: 4 }, transition: "all 0.2s" }}
                >
                  <CardHeader
                    avatar={
                      <Typography variant="h5">
                        {getCategoryIcon(contract.category)}
                      </Typography>
                    }
                    title={contract.name}
                    subheader={contract.provider}
                    action={getStatusBadge(contract.status)}
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          typography: "body2",
                        }}
                      >
                        <Typography color="text.secondary">Mensuel:</Typography>
                        <Typography fontWeight={500}>
                          {formatCurrency(contract.monthlyAmount)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          typography: "body2",
                        }}
                      >
                        <Typography color="text.secondary">Annuel:</Typography>
                        <Typography fontWeight={500}>
                          {formatCurrency(contract.annualAmount)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          typography: "body2",
                        }}
                      >
                        <Typography color="text.secondary">Fin:</Typography>
                        <Typography fontWeight={500}>
                          {formatDate(contract.endDate)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                        <Button variant="outlined" size="small" fullWidth>
                          Modifier
                        </Button>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, contract.id)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItemMui onClick={handleMenuClose}>
          <Typography>👁️ Voir détails</Typography>
        </MenuItemMui>
        <MenuItemMui onClick={handleMenuClose}>
          <Typography>✏️ Modifier</Typography>
        </MenuItemMui>
        <MenuItemMui onClick={handleMenuClose}>
          <Typography>📋 Dupliquer</Typography>
        </MenuItemMui>
        <Divider />
        <MenuItemMui onClick={handleMenuClose}>
          <Typography>📁 Archiver</Typography>
        </MenuItemMui>
        <MenuItemMui
          onClick={() => {
            console.log("ID du contrat à supprimer:", selectedContractId);
            if (selectedContractId) {
              DeleteContract(selectedContractId);
            }
            handleMenuClose();
          }}
        >
          🗑️ Supprimer
        </MenuItemMui>
      </Menu>
    </Box>
  );
}
