"use client";

import { useRef, useState } from "react";
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
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  UploadFile as UploadFileIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { CreateSubscription } from "@/modules/contracts/actions";
import {
  CATEGORIES,
  FREQUENCIES,
  getCategory,
} from "@/modules/contracts/categories";
import { formatEuro } from "@/modules/contracts/calendar";

export default function NewContractPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [debitDay, setDebitDay] = useState<number | null>(null);
  const [debitDate, setDebitDate] = useState(""); // date complète pour "une fois"
  const [contractNumber, setContractNumber] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [document, setDocument] = useState<File | null>(null);

  const isOnce = frequency === "once";
  const parsedAmount = parseFloat(amount.replace(",", "."));
  const isValid =
    name.trim().length > 0 &&
    category !== "" &&
    !isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    (isOnce ? debitDate !== "" : debitDay !== null);

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("category", category);
    formData.set("amount", String(parsedAmount));
    formData.set("frequency", frequency);
    if (isOnce) {
      formData.set("debitDate", debitDate);
    } else if (debitDay !== null) {
      formData.set("debitDay", String(debitDay));
    }
    if (contractNumber.trim())
      formData.set("contractNumber", contractNumber.trim());
    if (renewalDate) formData.set("renewalDate", renewalDate);
    if (document) formData.set("document", document);

    try {
      const result = await CreateSubscription(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push("/calendar");
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  const selectedCategory = category ? getCategory(category) : null;
  const previewDay = isOnce
    ? debitDate
      ? new Date(debitDate).getDate()
      : null
    : debitDay;
  const previewWhen = isOnce
    ? debitDate
      ? ` · le ${new Date(debitDate).toLocaleDateString("fr-FR")}`
      : ""
    : debitDay
      ? ` · le ${debitDay} du mois`
      : "";

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100%", py: 4 }}>
      <Container maxWidth="sm">
        <Button
          component={Link}
          href="/calendar"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2, color: "text.secondary" }}
        >
          Retour au calendrier
        </Button>

        <Card>
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Ajouter un contrat
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              {/* Fournisseur / nom */}
              <TextField
                label="Fournisseur / nom du contrat"
                placeholder="ex. MAAF Habitation"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
              />

              {/* Catégorie */}
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Catégorie *
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                  {CATEGORIES.map((cat) => {
                    const selected = category === cat.id;
                    return (
                      <Box
                        key={cat.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setCategory(cat.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setCategory(cat.id);
                          }
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          cursor: "pointer",
                          border: "1px solid",
                          borderColor: selected ? cat.color : "divider",
                          bgcolor: selected ? `${cat.color}22` : "transparent",
                          transition: "all 120ms",
                          "&:hover": { borderColor: cat.color },
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: cat.color,
                          }}
                        />
                        <Typography variant="caption">{cat.label}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              {/* Montant + fréquence */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Montant"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      inputMode: "decimal",
                      endAdornment: (
                        <InputAdornment position="end">€</InputAdornment>
                      ),
                    },
                  }}
                  sx={{ flex: 1 }}
                />
                <ToggleButtonGroup
                  value={frequency}
                  exclusive
                  onChange={(_, v) => v && setFrequency(v)}
                  size="small"
                  sx={{ alignSelf: { sm: "center" } }}
                >
                  {FREQUENCIES.map((f) => (
                    <ToggleButton key={f.id} value={f.id} sx={{ px: 2 }}>
                      {f.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>

              {/* Jour de prélèvement : date unique ou mini-grille 1-31 */}
              {isOnce ? (
                <TextField
                  label="Date du prélèvement"
                  type="date"
                  value={debitDate}
                  onChange={(e) => setDebitDate(e.target.value)}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              ) : (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Jour de prélèvement *
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 0.5,
                      maxWidth: 320,
                    }}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                      const selected = debitDay === day;
                      return (
                        <Box
                          key={day}
                          role="button"
                          tabIndex={0}
                          onClick={() => setDebitDay(day)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setDebitDay(day);
                            }
                          }}
                          sx={{
                            aspectRatio: "1 / 1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 1.5,
                            cursor: "pointer",
                            fontSize: 13,
                            fontFamily: "var(--font-display)",
                            color: selected ? "#fff" : "text.secondary",
                            background: selected
                              ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                              : "rgba(255,255,255,0.04)",
                            "&:hover": {
                              background: selected
                                ? "linear-gradient(135deg, #8b5cf6, #3b82f6)"
                                : "rgba(255,255,255,0.1)",
                            },
                          }}
                        >
                          {day}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/* Champs optionnels */}
              <TextField
                label="Référence contrat (optionnel)"
                value={contractNumber}
                onChange={(e) => setContractNumber(e.target.value)}
                fullWidth
              />
              <TextField
                label="Date de renouvellement / échéance (optionnel)"
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                fullWidth
              />

              {/* Document PDF */}
              <Box>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  hidden
                  onChange={(e) => setDocument(e.target.files?.[0] ?? null)}
                />
                {document ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <UploadFileIcon fontSize="small" color="primary" />
                    <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                      {document.name}
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={() => {
                        setDocument(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      Retirer
                    </Button>
                  </Stack>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Document du contrat (PDF, optionnel)
                  </Button>
                )}
              </Box>

              {/* Aperçu live */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "rgba(255,255,255,0.02)",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 1 }}
                >
                  Aperçu dans le calendrier
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2.5,
                      bgcolor: "rgba(255,255,255,0.04)",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.25,
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 5,
                        fontSize: 9,
                        color: "text.secondary",
                      }}
                    >
                      {previewDay ?? "–"}
                    </Typography>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor:
                          selectedCategory?.color ?? "rgba(255,255,255,0.15)",
                        mt: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "text.secondary",
                      }}
                    >
                      {!isNaN(parsedAmount) && parsedAmount > 0
                        ? formatEuro(parsedAmount)
                        : "—"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {name.trim() || "Nom du contrat"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedCategory?.label ?? "Catégorie"}
                      {previewWhen}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Actions */}
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  component={Link}
                  href="/calendar"
                  color="inherit"
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                >
                  {loading ? "Ajout en cours…" : "Ajouter au calendrier"}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
