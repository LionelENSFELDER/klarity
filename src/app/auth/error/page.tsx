"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const errors = {
  Configuration: "Il y a un problème avec la configuration du serveur.",
  AccessDenied:
    "Accès refusé. Vous n'avez pas l'autorisation d'accéder à cette application.",
  Verification: "Le token de vérification a expiré ou a déjà été utilisé.",
  Default: "Une erreur inattendue s'est produite.",
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as keyof typeof errors;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white font-bold text-2xl">❌</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Erreur de connexion
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Un problème est survenu lors de l'authentification
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-red-600 flex items-center">
              <span className="mr-2">🚫</span>
              Connexion échouée
            </CardTitle>
            <CardDescription className="text-base">
              {errors[error] || errors.Default}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Alert */}
            <Alert className="bg-red-50 border-red-200">
              <span className="text-red-500">ℹ️</span>
              <AlertDescription className="text-red-800">
                <div className="space-y-2">
                  <p className="font-medium">Solutions recommandées :</p>
                  <ul className="text-sm space-y-1 list-disc list-inside ml-2">
                    <li>Vérifiez votre connexion internet</li>
                    <li>Réessayez de vous connecter</li>
                    <li>Videz le cache de votre navigateur</li>
                    <li>Contactez le support si le problème persiste</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 h-11">
                <Link href="/auth/signin">
                  <span className="mr-2">🔄</span>
                  Réessayer la connexion
                </Link>
              </Button>
              <Button variant="outline" asChild className="flex-1 h-11">
                <Link href="/">
                  <span className="mr-2">🏠</span>
                  Retour à l'accueil
                </Link>
              </Button>
            </div>

            {/* Dev Debug Info */}
            {process.env.NODE_ENV === "development" && (
              <>
                <Separator />
                <Alert className="bg-gray-50 border-gray-200">
                  <span className="text-gray-500">🔧</span>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">
                          Debug Info
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Development
                        </Badge>
                      </div>
                      <div className="bg-gray-100 rounded p-3">
                        <code className="text-xs text-gray-700 block">
                          Error Code: {error || "Unknown"}
                        </code>
                        <code className="text-xs text-gray-700 block mt-1">
                          Timestamp: {new Date().toISOString()}
                        </code>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="pt-6">
            <div className="text-center">
              <h4 className="font-medium text-blue-900 mb-2">
                Besoin d'aide ?
              </h4>
              <p className="text-sm text-blue-800 mb-4">
                Si le problème persiste, voici quelques ressources utiles
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant="secondary"
                  className="text-blue-700 bg-blue-100"
                >
                  📧 Support technique
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-blue-700 bg-blue-100"
                >
                  📚 Documentation
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-blue-700 bg-blue-100"
                >
                  💬 Chat en ligne
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
