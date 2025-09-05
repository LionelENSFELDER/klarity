import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { signOut } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Si pas de session, rediriger vers login
  if (!session) {
    redirect("/auth/signin");
  }

  const userInitials =
    session.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "??";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-lg">📋</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">Klarity</h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Gestion administrative simplifiée
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="/dashboard"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </a>
              <a
                href="/contracts"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contrats
              </a>
              <a
                href="/dashboard/analytics"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Analytics
              </a>
              <a
                href="/dashboard/settings"
                className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Paramètres
              </a>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {/* Add Contract Button */}
              <Button size="sm" className="hidden sm:flex">
                <span className="mr-1">+</span>
                Nouveau contrat
              </Button>

              {/* Notifications Badge */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="relative">
                  🔔
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500">
                    3
                  </Badge>
                </Button>
              </div>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={session.user?.image || undefined}
                        alt={session.user?.name || "User"}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name || "Utilisateur"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    👤 Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    💳 Facturation
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    🎨 Thème
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer">
                    📚 Aide & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/auth/signin" });
                      }}
                      className="w-full"
                    >
                      <button
                        type="submit"
                        className="w-full text-left flex items-center text-red-600 hover:text-red-700"
                      >
                        🚪 Déconnexion
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>© 2025 Klarity. Tous droits réservés.</span>
              <Badge variant="outline" className="text-xs">
                Alpha v0.1.0
              </Badge>
            </div>
            <div className="flex items-center space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-gray-700 transition-colors">
                Confidentialité
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Conditions
              </a>
              <a href="#" className="hover:text-gray-700 transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
