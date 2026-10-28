"use client";

import { SessionProvider } from "next-auth/react";
import MuiThemeProvider from "@/components/providers/MuiThemeProvider";
import { NotifyProvider } from "@/components/providers/NotifyProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MuiThemeProvider>
        <NotifyProvider>{children}</NotifyProvider>
      </MuiThemeProvider>
    </SessionProvider>
  );
}
