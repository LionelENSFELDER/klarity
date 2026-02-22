"use client";

import { SessionProvider } from "next-auth/react";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MuiThemeProvider>{children}</MuiThemeProvider>
    </SessionProvider>
  );
}
