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
import { CreateContract } from "@/modules/contracts/actions";
import { ContractFormData } from "@/modules/contracts/types";

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<ContractFormData>({
    name: "",
    provider: "",
    contractNumber: "",
    category: "",
    status: "ACTIVE",
    monthlyAmount: null,
    annualAmount: null,
    startDate: null,
    endDate: null,
    renewalDate: null,
    clientPhone: "",
    website: "",
    advisorName: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    console.log("Submitting form with data:", formData);

    try {
      const result = await CreateContract(formData);
      if (result?.error) {
        setError(result.error.message || "Erreur inconnue");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/contracts");
        }, 2000);
      }
    } catch (err) {
      console.error("Erreur lors de la création du contrat:", err);
      setError("Erreur lors de la création du contrat", err.message);
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Numéro de contrat"
                  name="contractNumber"
                  value={formData.contractNumber}
                  onChange={handleChange}
                  placeholder="Ex: AH-2024-051234"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
                <MenuItem value="ACTIVE">Actif</MenuItem>
                <MenuItem value="PENDING">En attente</MenuItem>
                <MenuItem value="EXPIRED">Expiré</MenuItem>
                <MenuItem value="ARCHIVED">Archivé</MenuItem>
              </Select>
            </FormControl>

            {/* Montants */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
              Montants
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Montant mensuel (€)"
                  name="monthlyAmount"
                  value={formData.monthlyAmount ?? ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      monthlyAmount:
                        e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                  placeholder="Ex: 45.50"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  disabled
                  fullWidth
                  type="number"
                  label="Montant annuel (€)"
                  name="annualAmount"
                  value={
                    formData.monthlyAmount == null
                      ? ""
                      : (formData.monthlyAmount * 12).toFixed(2)
                  }
                  onChange={handleChange}
                  placeholder="Ex: 546.00"
                />
              </Grid>
            </Grid>

            {/* Dates */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
              Dates
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de début"
                  name="startDate"
                  value={formData.startDate ?? ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de fin"
                  name="endDate"
                  value={formData.endDate ?? ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date de renouvellement"
                  name="renewalDate"
                  value={formData.renewalDate ?? ""}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* Coordonnées */}
            <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
              Coordonnées (optionnel)
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="clientPhone"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  placeholder="Ex: 05 49 73 73 73"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
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
