"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
  Stack,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FREQUENCIES } from "@/modules/contracts/categories";
import { findCategory, slugify } from "@/modules/categories/model";
import { CreateCategory } from "@/modules/categories/actions";
import { useCategories } from "./CategoriesProvider";
import {
  formatEuro,
  getUpcomingDebits,
  debitMonths,
  monthlyCost,
  resolveAnchorMonth,
  type CalendarContract,
} from "@/modules/contracts/calendar";
import FullIconSearchSelector, {
  IconOption,
} from "@/components/icons/FullIconSearchSelector";
import ContractAvatar from "./ContractAvatar";

interface ContractFormFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  provider: string;
  onProviderChange: (value: string) => void;
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
  selectedIcon: IconOption | null;
  onSelectedIconChange: (value: IconOption | null) => void;
  /** Mois de référence (0-11) d'un trimestriel ou d'un annuel. */
  anchorMonth: number | null;
  onAnchorMonthChange: (value: number) => void;
}

const DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/** « Prélevé chaque année en janvier » ou les quatre mois d'un trimestriel. */
export function anchorHelp(frequency: string, anchor: number | null): string {
  if (anchor === null) return "";
  if (frequency === "annual") return `Prélevé chaque année en ${MONTHS[anchor]}.`;
  const names = debitMonths(frequency, anchor).map((m) => MONTHS[m]);
  return `Prélevé en ${names.slice(0, 3).join(", ")} et ${names[3]}.`;
}

const choiceSx = (selected: boolean) => ({
  border: selected ? 1.5 : 1,
  borderColor: selected ? "primary.dark" : "divider",
  bgcolor: selected
    ? "rgba(var(--mui-palette-primary-mainChannel) / 0.1)"
    : "transparent",
  color: "text.primary",
  fontWeight: selected ? 600 : 400,
  font: "inherit",
  cursor: "pointer",
  "&:hover": { borderColor: "primary.dark" },
});

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Box component="fieldset" sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}>
      <Typography component="legend" sx={{ fontSize: 16, fontWeight: 600, p: 0, mb: 2 }}>
        {title}
        {hint && (
          <Box component="span" sx={{ fontWeight: 400, fontSize: 13, color: "text.secondary" }}>
            {" "}· {hint}
          </Box>
        )}
      </Typography>
      <Stack spacing={2.25}>{children}</Stack>
    </Box>
  );
}

// Champs du formulaire de contrat, en trois temps, avec à côté un aperçu de
// la ligne telle qu'elle apparaîtra et de ses prochains prélèvements.
export default function ContractFormFields({
  name,
  onNameChange,
  provider,
  onProviderChange,
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
  selectedIcon,
  onSelectedIconChange,
  anchorMonth,
  onAnchorMonthChange,
}: ContractFormFieldsProps) {
  const categories = useCategories();
  const isOnce = frequency === "once";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 260px" },
        gap: 4,
        alignItems: "start",
      }}
    >
      <Stack spacing={3.5} divider={<Box sx={{ height: "1px", bgcolor: "divider" }} />}>
        <Section title="1 · Le contrat">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Nom du contrat"
              placeholder="ex. Assurance habitation"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              required
              fullWidth
            />
            {/* Distinct du nom : sert au regroupement dans le rail */}
            <TextField
              label="Fournisseur (optionnel)"
              placeholder="ex. MAAF"
              helperText="Laissé vide, le nom du contrat est repris."
              value={provider}
              onChange={(e) => onProviderChange(e.target.value)}
              fullWidth
            />
          </Stack>

          <FullIconSearchSelector value={selectedIcon} onChange={onSelectedIconChange} />

          <Box>
            <Typography id="category-label" sx={{ fontWeight: 500, mb: 1 }}>
              Catégorie *
            </Typography>
            <Stack
              role="group"
              aria-labelledby="category-label"
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
            >
              {categories.map((cat) => {
                const selected = category === cat.slug;
                return (
                  <Box
                    key={cat.slug}
                    component="button"
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onCategoryChange(cat.slug)}
                    sx={{
                      ...choiceSx(selected),
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      height: 38,
                      px: 1.75,
                      borderRadius: 999,
                      fontSize: 14,
                    }}
                  >
                    <Box sx={{ width: 10, height: 10, borderRadius: 0.75, bgcolor: cat.color }} />
                    {cat.label}
                  </Box>
                );
              })}
              <NewCategory
                takenSlugs={categories.map((c) => c.slug)}
                onCreated={onCategoryChange}
              />
            </Stack>
          </Box>
        </Section>

        <Section title="2 · Le prélèvement">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
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
              sx={{ flex: "1 1 160px" }}
            />
            <ToggleButtonGroup
              value={frequency}
              exclusive
              aria-label="Fréquence"
              onChange={(_, v) => v && onFrequencyChange(v)}
              sx={{
                flex: "2 1 300px",
                bgcolor: "action.hover",
                p: 0.5,
                borderRadius: 3.5,
                height: 56,
                boxSizing: "border-box",
                "& .MuiToggleButton-root": {
                  flex: 1,
                  border: 0,
                  borderRadius: "10px !important",
                  textTransform: "none",
                  color: "text.primary",
                },
                "& .Mui-selected": {
                  bgcolor: "background.paper !important",
                  fontWeight: 600,
                  boxShadow: 1,
                },
              }}
            >
              {FREQUENCIES.map((f) => (
                <ToggleButton key={f.id} value={f.id}>
                  {f.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>

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
              <Typography id="debit-day-label" sx={{ fontWeight: 500, mb: 1 }}>
                Jour du prélèvement *
              </Typography>
              <Box
                role="group"
                aria-labelledby="debit-day-label"
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
                  gap: 0.75,
                  maxWidth: 480,
                }}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const selected = debitDay === day;
                  return (
                    <Box
                      key={day}
                      component="button"
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onDebitDayChange(day)}
                      sx={{
                        ...choiceSx(selected),
                        height: 38,
                        borderRadius: 2.5,
                        fontSize: 13,
                        ...(selected && {
                          bgcolor: "primary.main",
                          borderColor: "primary.dark",
                          color: "primary.contrastText",
                          fontWeight: 700,
                          "&:hover": { bgcolor: "primary.main" },
                        }),
                      }}
                    >
                      {day}
                    </Box>
                  );
                })}
              </Box>
              <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 1 }}>
                Les mois plus courts, le prélèvement tombe le dernier jour.
              </Typography>
            </Box>
          )}

          {(frequency === "quarterly" || frequency === "annual") && (
            <TextField
              select
              label="Mois de référence"
              value={anchorMonth ?? ""}
              onChange={(e) => onAnchorMonthChange(Number(e.target.value))}
              helperText={anchorHelp(frequency, anchorMonth)}
              sx={{ maxWidth: 320 }}
            >
              {MONTHS.map((m, i) => (
                <MenuItem key={m} value={i}>
                  {cap(m)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Section>

        <Section title="3 · Détails" hint="optionnels">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Date de renouvellement / échéance (optionnel)"
              type="date"
              value={renewalDate}
              onChange={(e) => onRenewalDateChange(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Référence contrat (optionnel)"
              value={contractNumber}
              onChange={(e) => onContractNumberChange(e.target.value)}
              fullWidth
            />
          </Stack>
        </Section>
      </Stack>

      <Preview
        name={name}
        provider={provider}
        category={category}
        amount={amount}
        frequency={frequency}
        debitDay={debitDay}
        debitDate={debitDate}
        selectedIcon={selectedIcon}
        anchorMonth={anchorMonth}
      />
    </Box>
  );
}

/** « + Nouvelle » : crée la catégorie et la sélectionne aussitôt. */
function NewCategory({
  takenSlugs,
  onCreated,
}: {
  takenSlugs: string[];
  onCreated: (slug: string) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!open) {
    return (
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(true)}
        sx={{
          height: 38,
          px: 1.75,
          borderRadius: 999,
          border: "1px dashed",
          borderColor: "divider",
          bgcolor: "transparent",
          color: "primary.dark",
          ".dark &": { color: "primary.light" },
          font: "inherit",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        + Nouvelle
      </Box>
    );
  }

  const create = () =>
    startTransition(async () => {
      // Même calcul que le serveur, sur la même liste : on connaît le slug
      // sans attendre le rechargement des catégories.
      const slug = slugify(label.trim(), takenSlugs);
      const result = await CreateCategory(label);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      onCreated(slug);
      setOpen(false);
      setLabel("");
      setError("");
      router.refresh();
    });

  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: "100%" }}>
      <TextField
        size="small"
        label="Nom de la nouvelle catégorie"
        value={label}
        autoFocus
        error={Boolean(error)}
        helperText={error || undefined}
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (label.trim()) create();
          }
        }}
        sx={{ flex: 1 }}
      />
      <Button variant="contained" disabled={!label.trim() || pending} onClick={create}>
        Créer
      </Button>
      <Button color="inherit" onClick={() => setOpen(false)}>
        Annuler
      </Button>
    </Stack>
  );
}

function Preview({
  name,
  provider,
  category,
  amount,
  frequency,
  debitDay,
  debitDate,
  selectedIcon,
  anchorMonth,
}: {
  name: string;
  provider: string;
  category: string;
  amount: string;
  frequency: string;
  debitDay: number | null;
  debitDate: string;
  selectedIcon: IconOption | null;
  anchorMonth: number | null;
}) {
  const categories = useCategories();
  const cat = findCategory(categories, category);
  const parsed = parseFloat(amount.replace(",", "."));
  const value = !isNaN(parsed) && parsed > 0 ? parsed : 0;
  const isOnce = frequency === "once";
  const today = new Date();
  const day = isOnce ? (debitDate ? new Date(debitDate).getDate() : null) : debitDay;

  // Même règle que le serveur : le mois du contrat, sinon le mois en cours.
  const draft: CalendarContract = {
    id: "apercu",
    name: name.trim() || "Nom du contrat",
    provider: provider.trim() || name.trim(),
    contractNumber: null,
    category,
    amount: value,
    frequency,
    debitDay: day ?? 1,
    anchorMonth: resolveAnchorMonth(frequency, anchorMonth, today),
    startDate: isOnce && debitDate ? new Date(debitDate).toISOString() : null,
    renewalDate: null,
    iconType: selectedIcon?.type ?? null,
    iconValue: selectedIcon?.slugOrName ?? null,
  };
  const upcoming = day !== null ? getUpcomingDebits([draft], today, 13).slice(0, 3) : [];
  const perMonth = monthlyCost(draft);
  const freqLabel = FREQUENCIES.find((f) => f.id === frequency)?.label.toLowerCase() ?? frequency;

  return (
    <Stack component="aside" aria-label="Aperçu" spacing={2} sx={{ display: { xs: "none", md: "flex" } }}>
      <Typography sx={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary" }}>
        Aperçu en direct
      </Typography>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ border: 1, borderColor: "divider", borderRadius: 4, p: 1.75 }}>
        <ContractAvatar contract={draft} category={cat} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600 }} noWrap>{draft.name}</Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }} noWrap>
            {draft.provider || "Fournisseur"} · {freqLabel}
            {day !== null && !isOnce ? ` · le ${day === 1 ? "1er" : day}` : ""}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
          {value > 0 ? formatEuro(value) : "—"}
        </Typography>
      </Stack>

      <Stack spacing={1.25} sx={{ border: 1, borderColor: "divider", borderRadius: 4, p: 2 }}>
        <Typography sx={{ fontWeight: 600 }}>Prochains prélèvements</Typography>
        {upcoming.length === 0 ? (
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            Choisissez {isOnce ? "une date" : "un jour"} pour les voir ici.
          </Typography>
        ) : (
          upcoming.map((o) => (
            <Stack key={o.date.toISOString()} direction="row" justifyContent="space-between" spacing={1}>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{cap(DATE_FORMAT.format(o.date))}</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
                {value > 0 ? formatEuro(value) : "—"}
              </Typography>
            </Stack>
          ))
        )}
        {perMonth > 0 && (
          <>
            <Box sx={{ height: "1px", bgcolor: "divider" }} />
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Par mois, lissé</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {formatEuro(Math.round(perMonth * 100) / 100)}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Sur 12 mois</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                {formatEuro(Math.round(perMonth * 12 * 100) / 100)}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Stack>
  );
}
