"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@mui/material";
import ContractFormDialog from "./ContractFormDialog";

// Bouton "Ajouter un contrat" prêt à l'emploi : ouvre la popup de
// création au clic, sans navigation de page. Toutes les props sont
// transmises au Button MUI sous-jacent (variant, startIcon, sx…).
export default function AddContractButton(props: ButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button {...props} onClick={() => setOpen(true)} />
      <ContractFormDialog
        open={open}
        mode="create"
        onClose={() => setOpen(false)}
      />
    </>
  );
}
