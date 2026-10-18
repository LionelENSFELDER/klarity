"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@mui/material";
import ContractFormDialog from "./ContractFormDialog";

// Bouton « Nouveau contrat » prêt à l'emploi : ouvre la popup de création
// au clic, sans navigation. Toutes les props vont au Button MUI sous-jacent.
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
