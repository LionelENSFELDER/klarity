"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import Link from "next/link";

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    contractNumber: "",
    category: "",
    status: "active",
    monthlyAmount: "",
    annualAmount: "",
    startDate: "",
    endDate: "",
    renewalDate: "",
    clientPhone: "",
    website: "",
    advisorName: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/contrat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/contracts");
        }, 1500);
      } else {
        const data = await response.json();
        setError(data.error || "Une erreur s'est produite");
      }
    } catch (err) {
      setError("Erreur lors de la création du contrat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/contracts"
          startIcon={<ArrowBackIcon />}
          variant="outlined"
        >
          Retour
        </Button>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Nouveau contrat
          </Typography>
          <Typography color="text.secondary">
            Ajoutez un nouveau contrat à votre base de données
          </Typography>
        </Box>
      </Stack>

      {/* Form Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Stack component="form" onSubmit={handleSubmit} spacing={3}>
            {/* Alerts */}
            {error && <Alert severity="error">{error}</Alert>}
            {success && (
              <Alert severity="success">
                Contrat créé avec succès ! Redirection...
              </Alert>
            )}

            {/* Informations principales */}
            <Typography variant="h6" fontWeight={600}>
              Informations principales
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Nom du contrat"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Assurance Habitation"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Fournisseur"
                  name="provider"
                  value={formData.provider}
                  onChange={handleChange}
                  placeholder="Ex: MAIF"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Numéro de contrat"
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleChange}
                  placeholder="Ex: AH-2024-051234"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    label="Catégorie"
                  >
                    <MenuItem value="">Sélectionner...</MenuItem>
                    <MenuItem value="assurance-habitation">
                      Assurance Habitation
                    </MenuItem>
                    <MenuItem value="assurance-auto">Assurance Auto</MenuItem>
                    <MenuItem value="sante">Santé / Mutuelle</MenuItem>
                    <MenuItem value="energie">Énergie</MenuItem>
                    <MenuItem value="telecom">Télécommunications</MenuItem>
                    <MenuItem value="banque">Banque</MenuItem>
                    <MenuItem value="abonnement">Abonnement</MenuItem>
                    <MenuItem value="autre">Autre</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth>
              <InputLabel>Statut</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                label="Statut"
              >
                <MenuItem value="active">Actif</MenuItem>
                <MenuItem value="pending">En attente</MenuItem>
                <MenuItem value="expired">Expiré</MenuItem>
                <MenuItem value="archived">Archivé</MenuItem>
              </Select>
            </FormControl>

            {/* Montants */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
              Montants
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Montant mensuel (€)"
                  name="monthlyAmount"
                  value={formData.monthlyAmount}
                  onChange={handleChange}
                  placeholder="Ex: 45.50"
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Montant annuel (€)"
                  name="annualAmount"
                  value={formData.annualAmount}
                  onChange={handleChange}
                  placeholder="Ex: 546.00"
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
            </Grid>

            {/* Dates */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
              Dates
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de début"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de fin"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de renouvellement"
                  name="renewalDate"
                  value={formData.renewalDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Coordonnées */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
              Coordonnées (optionnel)
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  placeholder="Ex: 05 49 73 73 73"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Site web"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Ex: https://www.example.com"
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Nom du conseiller"
              name="advisorName"
              value={formData.advisorName}
              onChange={handleChange}
              placeholder="Ex: Marie Dupont"
            />

            {/* Notes */}
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Ajoutez des informations supplémentaires..."
            />

            {/* Actions */}
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button
                component={Link}
                href="/contracts"
                variant="outlined"
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? "Création..." : "Créer le contrat"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
