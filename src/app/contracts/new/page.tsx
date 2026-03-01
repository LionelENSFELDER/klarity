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
import { z } from "zod";
import { CreateContract } from "@/modules/contracts/actions";
import { ContractFormData } from "@/modules/contracts/types";

// Type pour le formulaire (avec strings pour les dates)
type FormData = {
  name: string;
  provider: string;
  contractNumber: string;
  category: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED" | "ARCHIVED";
  monthlyAmount: number | null;
  annualAmount: number | null;
  startDate: string | null;
  endDate: string | null;
  renewalDate: string | null;
  clientPhone: string;
  website: string;
  advisorName: string;
  notes: string;
};

const contractSchema = z
  .object({
    name: z.string().min(1, "Le nom est requis"),
    provider: z.string().min(1, "Le fournisseur est requis"),
    contractNumber: z.string(),
    category: z.string().min(1, "La catégorie est requise"),
    status: z.enum(["ACTIVE", "PENDING", "EXPIRED", "ARCHIVED"]),
    monthlyAmount: z
      .number()
      .positive("Le montant doit être positif")
      .nullable(),
    annualAmount: z.number().nullable(),
    startDate: z
      .date({ message: "La date de début doit être une date valide" })
      .nullable(),
    endDate: z
      .date({ message: "La date de fin doit être une date valide" })
      .nullable(),
    renewalDate: z
      .date({ message: "La date de renouvellement doit être une date valide" })
      .nullable(),
    clientPhone: z.string(),
    website: z
      .string()
      .refine(
        (val) => !val || val === "" || z.string().url().safeParse(val).success,
        { message: "URL invalide" },
      ),
    advisorName: z.string(),
    notes: z.string(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "La date de fin doit être après la date de début",
      path: ["endDate"],
    },
  );

export default function NewContractPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState<FormData>({
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

  const DATE_FIELDS = ["startDate", "endDate", "renewalDate"] as const;

  // Convertit une string "YYYY-MM-DD" en Date ou null
  const toDate = (value: string | null): Date | null => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  // Validation d'un champ individuel
  const validateField = (
    name: string,
    value: string | number | Date | null,
  ) => {
    try {
      const fieldSchema =
        contractSchema.shape[name as keyof typeof contractSchema.shape];
      if (fieldSchema) {
        fieldSchema.parse(value);
        setFieldErrors((prev) => {
          const copy = { ...prev };
          delete copy[name];
          return copy;
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setFieldErrors((prev) => ({
          ...prev,
          [name]: err.issues[0].message,
        }));
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if ((DATE_FIELDS as readonly string[]).includes(name)) {
      // Garder la string dans le state UI, valider avec un objet Date
      const dateValue = value === "" ? null : value;
      setFormData((prev) => ({ ...prev, [name]: dateValue }));
      validateField(name, toDate(dateValue));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      validateField(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setFieldErrors({});

    try {
      // Convertir les strings en Date avant la validation Zod
      const dataToValidate = {
        ...formData,
        startDate: toDate(formData.startDate),
        endDate: toDate(formData.endDate),
        renewalDate: toDate(formData.renewalDate),
      };

      const validatedData = contractSchema.parse(dataToValidate);

      // CreateContract gère la conversion des dates
      await CreateContract(validatedData as unknown as ContractFormData);
      setSuccess(true);
      setTimeout(() => {
        router.push("/contracts");
      }, 1500);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Mapper toutes les erreurs de validation
        const errors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            errors[issue.path[0].toString()] = issue.message;
          }
        });
        setFieldErrors(errors);
        setError("Veuillez corriger les erreurs dans le formulaire");
      } else if (err instanceof Error) {
        console.error("Erreur création contrat:", err);
        setError(err.message || "Erreur lors de la création du contrat");
      } else {
        setError("Erreur lors de la création du contrat");
      }
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
                  error={!!fieldErrors.name}
                  helperText={fieldErrors.name}
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
                  error={!!fieldErrors.provider}
                  helperText={fieldErrors.provider}
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
                  error={!!fieldErrors.contractNumber}
                  helperText={fieldErrors.contractNumber}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!fieldErrors.category}>
                  <InputLabel>Catégorie</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        category: value,
                      }));
                      validateField("category", value);
                    }}
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
                  onChange={(e) => {
                    const value =
                      e.target.value === "" ? null : Number(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      monthlyAmount: value,
                    }));
                    validateField("monthlyAmount", value);
                  }}
                  placeholder="Ex: 45.50"
                  error={!!fieldErrors.monthlyAmount}
                  helperText={fieldErrors.monthlyAmount}
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
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldErrors.startDate}
                  helperText={fieldErrors.startDate}
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
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldErrors.endDate}
                  helperText={fieldErrors.endDate}
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
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldErrors.renewalDate}
                  helperText={fieldErrors.renewalDate}
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
                  error={!!fieldErrors.clientPhone}
                  helperText={fieldErrors.clientPhone}
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
                  error={!!fieldErrors.website}
                  helperText={fieldErrors.website}
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
              error={!!fieldErrors.advisorName}
              helperText={fieldErrors.advisorName}
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
