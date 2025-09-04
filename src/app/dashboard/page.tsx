import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Erreur de session</div>;
  }

  // Récupérer les stats utilisateur
  const stats = await prisma.contract.aggregate({
    where: { userId: session.user.id },
    _sum: {
      monthlyAmount: true,
      annualAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const activeContracts = await prisma.contract.count({
    where: {
      userId: session.user.id,
      status: "active",
    },
  });

  // Récupérer les contrats récents
  const recentContracts = await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Calculer les contrats par catégorie
  const contractsByCategory = await prisma.contract.groupBy({
    by: ["category"],
    where: { userId: session.user.id },
    _count: {
      id: true,
    },
  });

  const totalMonthly = stats._sum.monthlyAmount || 0;
  const totalAnnual = stats._sum.annualAmount || 0;
  const budgetTarget = 1000; // Budget cible mensuel
  const budgetProgress = Math.min((totalMonthly / budgetTarget) * 100, 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              Bonjour, {session.user.name?.split(" ")[0]} !
              <span className="ml-2">👋</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Voici un aperçu de vos contrats et finances
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="shadow-sm">
              <span className="mr-2">+</span>
              Ajouter un contrat
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Contrats actifs
            </CardTitle>
            <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📄</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {activeContracts}
            </div>
            <p className="text-xs text-blue-600/70 mt-1">
              Sur {stats._count.id} au total
            </p>
            <div className="flex items-center mt-2">
              <Badge
                variant="secondary"
                className="bg-blue-200 text-blue-700 text-xs"
              >
                +2 ce mois-ci
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Coût mensuel
            </CardTitle>
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">💰</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalMonthly.toFixed(2)}€
            </div>
            <p className="text-xs text-green-600/70 mt-1">
              Prélèvements mensuels
            </p>
            <div className="flex items-center mt-2">
              <Progress value={budgetProgress} className="flex-1 h-2" />
              <span className="ml-2 text-xs text-green-600">
                {budgetProgress.toFixed(0)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Coût annuel
            </CardTitle>
            <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">📊</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {totalAnnual.toFixed(2)}€
            </div>
            <p className="text-xs text-purple-600/70 mt-1">
              Budget total annuel
            </p>
            <div className="flex items-center mt-2">
              <Badge
                variant="outline"
                className="border-purple-300 text-purple-700 text-xs"
              >
                Moyenne: {(totalAnnual / 12).toFixed(0)}€/mois
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Alertes
            </CardTitle>
            <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">⚠️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">3</div>
            <p className="text-xs text-orange-600/70 mt-1">
              Renouvellements proches
            </p>
            <div className="flex items-center mt-2">
              <Badge variant="destructive" className="bg-orange-500 text-xs">
                Action requise
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="contracts">Contrats récents</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Welcome Message */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🎉</span>
                  Bienvenue sur Klarity !
                </CardTitle>
                <CardDescription>
                  Votre plateforme de gestion administrative est configurée
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats._count.id > 0 ? (
                  <Alert className="bg-green-50 border-green-200">
                    <span className="text-green-600">✅</span>
                    <AlertDescription className="text-green-800">
                      <div className="space-y-2">
                        <p className="font-medium">
                          Données chargées avec succès !
                        </p>
                        <p className="text-sm">
                          Vous avez {stats._count.id} contrats dans votre base
                          de données. Explorez vos contrats, ajoutez-en de
                          nouveaux et suivez vos échéances.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-blue-50 border-blue-200">
                    <span className="text-blue-600">🚀</span>
                    <AlertDescription className="text-blue-800">
                      <div className="space-y-2">
                        <p className="font-medium">Commencez votre gestion !</p>
                        <p className="text-sm">
                          Lancez{" "}
                          <code className="bg-blue-100 px-2 py-1 rounded text-xs">
                            npm run db:seed
                          </code>{" "}
                          pour charger des données de test.
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Actions rapides :
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <span className="mr-2">📄</span>
                      Nouveau contrat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <span className="mr-2">📊</span>
                      Voir analytics
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <span className="mr-2">🔔</span>
                      Alertes (3)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <span className="mr-2">⚙️</span>
                      Paramètres
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Budget mensuel</CardTitle>
                <CardDescription>
                  Suivi de vos dépenses contractuelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dépensé ce mois</span>
                    <span className="font-medium">
                      {totalMonthly.toFixed(2)}€
                    </span>
                  </div>
                  <Progress value={budgetProgress} className="h-3" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0€</span>
                    <span>Objectif: {budgetTarget}€</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Répartition par catégorie :</h4>
                  <div className="space-y-2">
                    {contractsByCategory.map((category) => (
                      <div
                        key={category.category}
                        className="flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-sm capitalize">
                            {category.category.replace(/-/g, " ")}
                          </span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {category._count.id}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contrats récents</CardTitle>
              <CardDescription>Vos 5 derniers contrats ajoutés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600">📄</span>
                      </div>
                      <div>
                        <p className="font-medium">{contract.name}</p>
                        <p className="text-sm text-gray-500">
                          {contract.provider}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">
                          {contract.monthlyAmount?.toFixed(2) || "N/A"}€
                        </p>
                        <p className="text-xs text-gray-500">par mois</p>
                      </div>
                      <Badge
                        variant={
                          contract.status === "active" ? "default" : "secondary"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics détaillées</CardTitle>
              <CardDescription>
                Analyse de vos dépenses et contrats (Fonctionnalité à venir)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <span className="text-6xl">📊</span>
                <h3 className="text-lg font-medium mt-4">
                  Analytics en développement
                </h3>
                <p className="text-gray-500 mt-2">
                  Cette section contiendra des graphiques et analyses détaillées
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertes et notifications</CardTitle>
              <CardDescription>
                Gérez vos rappels et notifications importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-orange-50 border-orange-200">
                  <span className="text-orange-600">⚠️</span>
                  <AlertDescription className="text-orange-800">
                    <p className="font-medium">3 renouvellements approchent</p>
                    <p className="text-sm mt-1">
                      Vérifiez vos contrats arrivant à échéance ce mois.
                    </p>
                  </AlertDescription>
                </Alert>

                <Alert className="bg-blue-50 border-blue-200">
                  <span className="text-blue-600">ℹ️</span>
                  <AlertDescription className="text-blue-800">
                    <p className="font-medium">Nouveau contrat ajouté</p>
                    <p className="text-sm mt-1">
                      Votre contrat "Assurance Auto" a été créé avec succès.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
