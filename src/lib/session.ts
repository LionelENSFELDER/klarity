import { cache } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

// Un chargement de page (ex. /calendar) déclenchait jusqu'à 4 appels
// getServerSession indépendants (header + page + plusieurs requêtes) au
// sein du même rendu serveur. React.cache() déduplique ces appels par
// requête : un seul décodage JWT réel, les appels suivants réutilisent
// le résultat déjà résolu.
export const getSession = cache(() => getServerSession(authOptions));
