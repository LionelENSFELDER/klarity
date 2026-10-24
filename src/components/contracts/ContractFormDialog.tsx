"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import { CreateSubscription, EditSubscription } from "@/modules/contracts/actions";
import type { CalendarContract } from "@/modules/contracts/calendar";
import ContractFormFields from "./ContractFormFields";
import type { IconOption } from "@/components/icons/FullIconSearchSelector";

type ContractFormDialogProps =
  | { open: boolean; mode: "create"; contract?: null; onClose: () => void }
  | { open: boolean; mode: "edit"; contract: CalendarContract | null; onClose: () => void };

const EMPTY_STATE = {
  name: "",
  provider: "",
  category: "",
  amount: "",
  frequency: "monthly",
  debitDay: null as number | null,
  debitDate: "",
  // Mois de référence par défaut : le mois en cours, comme côté serveur.
  anchorMonth: null as number | null,
  contractNumber: "",
  renewalDate: "",
  selectedIcon: null as IconOption | null,
};

// Popup de création / édition d'un contrat. En mode édition, elle est
// hydratée depuis le contrat sélectionné dans la vue calendrier ; en
// mode création, elle démarre avec des champs vides. Les deux modes
// réutilisent les mêmes champs (ContractFormFields).
export default function ContractFormDialog({
  open,
  mode,
  contract,
  onClose,
}: ContractFormDialogProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(EMPTY_STATE.name);
  const [provider, setProvider] = useState(EMPTY_STATE.provider);
  const [category, setCategory] = useState(EMPTY_STATE.category);
  const [amount, setAmount] = useState(EMPTY_STATE.amount);
  const [frequency, setFrequency] = useState(EMPTY_STATE.frequency);
  const [debitDay, setDebitDay] = useState<number | null>(EMPTY_STATE.debitDay);
  const [debitDate, setDebitDate] = useState(EMPTY_STATE.debitDate);
  const [anchorMonth, setAnchorMonth] = useState<number | null>(EMPTY_STATE.anchorMonth);
  const [contractNumber, setContractNumber] = useState(EMPTY_STATE.contractNumber);
  const [renewalDate, setRenewalDate] = useState(EMPTY_STATE.renewalDate);
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(
    EMPTY_STATE.selectedIcon,
  );

  useEffect(() => {
    if (!open) return;
    setError("");

    if (mode === "edit" && contract) {
      setName(contract.name);
      // Avant la séparation des champs, provider recopiait le nom.
      setProvider(contract.provider === contract.name ? "" : contract.provider);
      setCategory(contract.category);
      setAmount(String(contract.amount));
      setFrequency(contract.frequency);
      setDebitDay(contract.frequency === "once" ? null : contract.debitDay);
      setAnchorMonth(contract.anchorMonth ?? new Date().getMonth());
      setDebitDate(
        contract.frequency === "once" && contract.startDate
          ? contract.startDate.slice(0, 10)
          : "",
      );
      setContractNumber(contract.contractNumber ?? "");
      setRenewalDate(
        contract.renewalDate ? contract.renewalDate.slice(0, 10) : "",
      );
      setSelectedIcon(
        contract.iconType === "brand" || contract.iconType === "generic"
          ? {
              type: contract.iconType,
              slugOrName: contract.iconValue ?? "",
              label: contract.iconValue ?? "",
            }
          : null,
      );
    } else {
      setName(EMPTY_STATE.name);
      setProvider(EMPTY_STATE.provider);
      setCategory(EMPTY_STATE.category);
      setAmount(EMPTY_STATE.amount);
      setFrequency(EMPTY_STATE.frequency);
      setDebitDay(EMPTY_STATE.debitDay);
      setDebitDate(EMPTY_STATE.debitDate);
      setAnchorMonth(new Date().getMonth());
      setContractNumber(EMPTY_STATE.contractNumber);
      setRenewalDate(EMPTY_STATE.renewalDate);
      setSelectedIcon(EMPTY_STATE.selectedIcon);
    }
  }, [open, mode, contract]);

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
    if (mode === "edit" && !contract) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("name", name.trim());
    if (provider.trim()) formData.set("provider", provider.trim());
    formData.set("category", category);
    formData.set("amount", String(parsedAmount));
    formData.set("frequency", frequency);
    if (isOnce) {
      formData.set("debitDate", debitDate);
    } else if (debitDay !== null) {
      formData.set("debitDay", String(debitDay));
    }
    if ((frequency === "quarterly" || frequency === "annual") && anchorMonth !== null) {
      formData.set("anchorMonth", String(anchorMonth));
    }
    if (contractNumber.trim())
      formData.set("contractNumber", contractNumber.trim());
    if (renewalDate) formData.set("renewalDate", renewalDate);
    if (selectedIcon) {
      formData.set("iconType", selectedIcon.type);
      formData.set("iconValue", selectedIcon.slugOrName);
    }

    try {
      const result =
        mode === "edit" && contract
          ? await EditSubscription(contract.id, formData)
          : await CreateSubscription(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      slotProps={{ paper: { sx: { borderRadius: 6 } } }}
    >
      <DialogTitle sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em", px: { xs: 2.5, sm: 4 }, pt: 3 }}>
        {mode === "edit" ? "Modifier le contrat" : "Ajouter un contrat"}
      </DialogTitle>
      <DialogContent dividers sx={{ px: { xs: 2.5, sm: 4 }, py: 3 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <ContractFormFields
            name={name}
            onNameChange={setName}
            provider={provider}
            onProviderChange={setProvider}
            category={category}
            onCategoryChange={setCategory}
            amount={amount}
            onAmountChange={setAmount}
            frequency={frequency}
            onFrequencyChange={setFrequency}
            debitDay={debitDay}
            onDebitDayChange={setDebitDay}
            debitDate={debitDate}
            onDebitDateChange={setDebitDate}
            contractNumber={contractNumber}
            onContractNumberChange={setContractNumber}
            renewalDate={renewalDate}
            onRenewalDateChange={setRenewalDate}
            selectedIcon={selectedIcon}
            onSelectedIconChange={setSelectedIcon}
            anchorMonth={anchorMonth}
            onAnchorMonthChange={setAnchorMonth}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, py: 2.5, gap: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          disabled={loading}
          sx={{ borderRadius: 999, minHeight: 46, px: 3, borderColor: "divider" }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isValid || loading}
          sx={{ borderRadius: 999, minHeight: 46, px: 3.5 }}
        >
          {loading
            ? "Enregistrement…"
            : mode === "edit"
              ? "Enregistrer"
              : "Ajouter au calendrier"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
