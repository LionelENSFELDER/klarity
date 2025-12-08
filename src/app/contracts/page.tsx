import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface Contract {
  id: string;
  name: string;
  provider: string;
  category: string;
  status: string;
  monthlyAmount: number | null;
  annualAmount: number | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Récupérer tous les contrats de l'utilisateur
  const contracts = (await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })) as Contract[];

  // Statistiques
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === "active").length,
    pending: contracts.filter((c) => c.status === "pending").length,
    expired: contracts.filter((c) => c.status === "expired").length,
    archived: contracts.filter((c) => c.status === "archived").length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        variant: "default" as const,
        label: "Actif",
        color: "bg-green-100 text-green-800",
      },
      pending: {
        variant: "secondary" as const,
        label: "En attente",
        color: "bg-yellow-100 text-yellow-800",
      },
      expired: {
        variant: "destructive" as const,
        label: "Expiré",
        color: "bg-red-100 text-red-800",
      },
      archived: {
        variant: "outline" as const,
        label: "Archivé",
        color: "bg-gray-100 text-gray-800",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      subscription: "💳",
      insurance: "🛡️",
      utilities: "⚡",
      telecommunications: "📱",
      software: "💻",
      entertainment: "🎬",
      finance: "🏦",
      other: "📄",
    };
    return icons[category as keyof typeof icons] || "📄";
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return `${amount.toFixed(2)}€`;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">📄</span>
            Mes Contrats
          </h1>
          <p className="text-gray-600 mt-1">
            Gérez tous vos contrats en un seul endroit
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button variant="outline">
            <span className="mr-2">📥</span>
            Importer
          </Button>
          <Link href="/contracts/new">
            <Button>
              <span className="mr-2">+</span>
              Nouveau contrat
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirés</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.expired}
                </p>
              </div>
              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">⚠️</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filtres et recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="🔍 Rechercher un contrat..."
                className="w-full"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="subscription">Abonnements</SelectItem>
                <SelectItem value="insurance">Assurances</SelectItem>
                <SelectItem value="utilities">Services publics</SelectItem>
                <SelectItem value="telecommunications">
                  Télécommunications
                </SelectItem>
                <SelectItem value="software">Logiciels</SelectItem>
                <SelectItem value="entertainment">Divertissement</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="archived">Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <Tabs defaultValue="table" className="space-y-6">
        <TabsList>
          <TabsTrigger value="table">Vue tableau</TabsTrigger>
          <TabsTrigger value="cards">Vue cartes</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>Liste des contrats</CardTitle>
              <CardDescription>
                {contracts.length} contrat{contracts.length > 1 ? "s" : ""} au
                total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Contrat</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Coût mensuel</TableHead>
                      <TableHead>Coût annuel</TableHead>
                      <TableHead>Date fin</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <span className="text-4xl mb-2">📄</span>
                            <p className="text-gray-500">
                              Aucun contrat trouvé
                            </p>
                            <Link href="/contracts/new" className="mt-2">
                              <Button variant="outline" size="sm">
                                Créer votre premier contrat
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      contracts.map((contract) => (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <span className="mr-2">
                                {getCategoryIcon(contract.category)}
                              </span>
                              {contract.name}
                            </div>
                          </TableCell>
                          <TableCell>{contract.provider}</TableCell>
                          <TableCell className="capitalize">
                            {contract.category.replace(/-/g, " ")}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(contract.monthlyAmount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(contract.annualAmount)}
                          </TableCell>
                          <TableCell>{formatDate(contract.endDate)}</TableCell>
                          <TableCell>
                            {getStatusBadge(contract.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Ouvrir menu</span>
                                  <span className="h-4 w-4">⋮</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <span className="mr-2">👁️</span>
                                  Voir détails
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <span className="mr-2">✏️</span>
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <span className="mr-2">📋</span>
                                  Dupliquer
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <span className="mr-2">📁</span>
                                  Archiver
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <span className="mr-2">🗑️</span>
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contracts.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <span className="text-6xl">📄</span>
                <h3 className="text-lg font-medium mt-4">Aucun contrat</h3>
                <p className="text-gray-500 mt-2">
                  Commencez par créer votre premier contrat
                </p>
                <Link href="/contracts/new" className="mt-4 inline-block">
                  <Button>
                    <span className="mr-2">+</span>
                    Nouveau contrat
                  </Button>
                </Link>
              </div>
            ) : (
              contracts.map((contract) => (
                <Card
                  key={contract.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {getCategoryIcon(contract.category)}
                        </span>
                        <div>
                          <CardTitle className="text-lg">
                            {contract.name}
                          </CardTitle>
                          <CardDescription>{contract.provider}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(contract.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mensuel:</span>
                      <span className="font-medium">
                        {formatCurrency(contract.monthlyAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Annuel:</span>
                      <span className="font-medium">
                        {formatCurrency(contract.annualAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Fin:</span>
                      <span className="font-medium">
                        {formatDate(contract.endDate)}
                      </span>
                    </div>
                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Modifier
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <span>⋮</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Voir détails</DropdownMenuItem>
                          <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                          <DropdownMenuItem>Archiver</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
