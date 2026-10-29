import type { Instrumentation } from "next";
import { logError } from "@/lib/errorLog";

// Toute erreur levée côté serveur (page, action, route) passe ici : le digest
// affiché à l'utilisateur permet de retrouver la ligne dans les journaux.
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const error = err as Error & { digest?: string };
  logError({
    source: "server",
    message: error.message,
    digest: error.digest,
    path: request.path,
    method: request.method,
    route: context.routePath,
    routeType: context.routeType,
  });
};
