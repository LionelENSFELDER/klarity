import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Confidentialité — Klarity",
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Confidentialité"
      updatedAt="18 octobre 2026"
      intro="Klarity sert à suivre vos contrats et prélèvements. Cette page décrit les données que l'application conserve, pourquoi, et comment vous en reprenez le contrôle."
      sections={[
        {
          title: "Données de compte",
          body: [
            "À la création du compte : votre adresse e-mail, votre nom, et — si vous passez par Google — la photo de profil associée. Le mot de passe, lorsqu'il est utilisé, est stocké sous forme de empreinte bcrypt, jamais en clair.",
          ],
        },
        {
          title: "Données de contrats",
          body: [
            "Tout ce que vous saisissez : nom du contrat, fournisseur, catégorie, montant, fréquence, jour de prélèvement, date de renouvellement, référence et notes.",
            "Ces données ne sont rattachées qu'à votre compte. Klarity ne se connecte à aucune banque et ne lit aucun relevé : rien n'est importé automatiquement.",
          ],
        },
        {
          title: "Hébergement",
          body: [
            "L'application est déployée sur Vercel et la base de données est hébergée chez Neon. Les échanges se font en HTTPS.",
          ],
        },
        {
          title: "Partage",
          body: [
            "Aucune donnée n'est vendue ni transmise à des fins publicitaires. Les seuls tiers impliqués sont les hébergeurs cités ci-dessus et, si vous l'utilisez, Google pour l'authentification.",
          ],
        },
        {
          title: "Conservation et suppression",
          body: [
            "Vos données sont conservées tant que le compte existe. La suppression d'un contrat l'efface de la base ; la suppression du compte efface les contrats associés.",
            "L'export de vos données et la suppression de votre compte se font en libre-service dans Réglages › Compte. La suppression est immédiate et définitive.",
          ],
        },
        {
          title: "Vos droits",
          body: [
            "Vous pouvez demander l'accès, la rectification, l'export ou l'effacement de vos données, ainsi que vous opposer à leur traitement. Le canal de contact est décrit sur la page Support.",
          ],
        },
      ]}
    />
  );
}
