"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Button, Snackbar } from "@mui/material";

interface Notice {
  message: string;
  /** Action proposée dans le bandeau, ex. « Annuler » après un archivage. */
  action?: { label: string; onClick: () => void };
}

type Notify = (notice: Notice | string) => void;

// Sans fournisseur (tests de composants isolés), la notification est ignorée.
const NotifyContext = createContext<Notify>(() => {});

export function useNotify(): Notify {
  return useContext(NotifyContext);
}

/** Bandeau de confirmation unique pour toute l'application. */
export function NotifyProvider({ children }: { children: React.ReactNode }) {
  const [notice, setNotice] = useState<(Notice & { key: number }) | null>(null);

  const notify = useCallback<Notify>((n) => {
    setNotice({ ...(typeof n === "string" ? { message: n } : n), key: Date.now() });
  }, []);

  const close = () => setNotice(null);

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar
        key={notice?.key}
        open={notice !== null}
        onClose={(_, reason) => reason !== "clickaway" && close()}
        autoHideDuration={notice?.action ? 6000 : 3500}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={notice?.message}
        action={
          notice?.action && (
            <Button
              color="primary"
              size="small"
              onClick={() => {
                notice.action?.onClick();
                close();
              }}
            >
              {notice.action.label}
            </Button>
          )
        }
      />
    </NotifyContext.Provider>
  );
}
