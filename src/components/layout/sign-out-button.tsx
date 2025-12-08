"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  return (
    <DropdownMenuItem
      className="cursor-pointer text-red-600 hover:text-red-700"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
    >
      🚪 Déconnexion
    </DropdownMenuItem>
  );
}
