"use client";

import { useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import { UploadFile as UploadFileIcon, Close as CloseIcon } from "@mui/icons-material";
import { CATEGORIES, FREQUENCIES, getCategory } from "@/modules/contracts/categories";
import { formatEuro } from "@/modules/contracts/calendar";
import FullIconSearchSelector, {
  IconOption,
} from "@/components/icons/FullIconSearchSelector";

interface ContractFormFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  frequency: string;
  onFrequencyChange: (value: string) => void;
  debitDay: number | null;
  onDebitDayChange: (value: number) => void;
  debitDate: string;
  onDebitDateChange: (value: string) => void;
  contractNumber: string;
  onContractNumberChange: (value: string) => void;
  renewalDate: string;
  onRenewalDateChange: (value: string) => void;
  document: File | null;
  onDocumentChange: (file: File | null) => void;
  existingDocumentName?: string | null;
  selectedIcon: IconOption | null;
  onSelectedIconChange: (value: IconOption | null) => void;
}

// Champs du formulaire de contrat, partagés entre la page de création
// et la popup d'édition (vue calendrier).
export default function ContractFormFields({
  name,
  onNameChange,
  category,
  onCategoryChange,
  amount,
  onAmountChange,
  frequency,
  onFrequencyChange,
  debitDay,
  onDebitDayChange,
  debitDate,
  onDebitDateChange,
  contractNumber,
  onContractNumberChange,
  renewalDate,
  onRenewalDateChange,
  document,
  onDocumentChange,
  existingDocumentName,
  selectedIcon,
  onSelectedIconChange,
}: ContractFormFieldsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOnce = frequency === "once";
  const parsedAmount = parseFloat(amount.replace(",", "."));
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
    <Stack spacing={3}>
      {/* Fournisseur / nom */}
      <TextField
        label="Fournisseur / nom du contrat"
        placeholder="ex. MAAF Habitation"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
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
                onClick={() => onCategoryChange(cat.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCategoryChange(cat.id);
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
      <Stack spacing={2}>
        <TextField
          label="Montant"
          placeholder="0,00"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          required
          slotProps={{
            input: {
              inputMode: "decimal",
              endAdornment: <InputAdornment position="end">€</InputAdornment>,
            },
          }}
          sx={{ flex: 1 }}
        />
        <ToggleButtonGroup
          value={frequency}
          exclusive
          onChange={(_, v) => v && onFrequencyChange(v)}
          size="small"
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
          onChange={(e) => onDebitDateChange(e.target.value)}
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
                  onClick={() => onDebitDayChange(day)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onDebitDayChange(day);
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
        onChange={(e) => onContractNumberChange(e.target.value)}
        fullWidth
      />
      <TextField
        label="Date de renouvellement / échéance (optionnel)"
        type="date"
        value={renewalDate}
        onChange={(e) => onRenewalDateChange(e.target.value)}
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
          onChange={(e) => onDocumentChange(e.target.files?.[0] ?? null)}
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
                onDocumentChange(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
            >
              Retirer
            </Button>
          </Stack>
        ) : existingDocumentName ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <UploadFileIcon fontSize="small" color="disabled" />
            <Typography
              variant="body2"
              noWrap
              sx={{ flex: 1 }}
              color="text.secondary"
            >
              Document actuel : {existingDocumentName}
            </Typography>
            <Button size="small" onClick={() => fileInputRef.current?.click()}>
              Remplacer
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

      {/*Icon search selector*/}
      <FullIconSearchSelector value={selectedIcon} onChange={onSelectedIconChange} />

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
                bgcolor: selectedCategory?.color ?? "rgba(255,255,255,0.15)",
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
    </Stack>
  );
}
