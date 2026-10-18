import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — Klarity",
};

export default function ConditionsPage() {
  return (
    <LegalPage
      title="Conditions d'utilisation"
      updatedAt="18 octobre 2026"
      intro="Klarity est en version alpha. Utiliser l'application vaut acceptation des points ci-dessous."
      sections={[
        {
          title: "Statut du service",
          body: [
            "L'application est en développement actif. Des fonctionnalités peuvent changer, être retirées, ou cesser de fonctionner sans préavis. Aucune disponibilité n'est garantie.",
            "Ne vous reposez pas sur Klarity comme source unique pour vos échéances : gardez vos documents de contrat et vos rappels ailleurs.",
          ],
        },
        {
          title: "Votre compte",
          body: [
            "Vous êtes responsable de l'accès à votre compte et de l'exactitude des informations que vous y saisissez. Un compte par personne.",
          ],
        },
        {
          title: "Usage attendu",
          body: [
            "Klarity sert à suivre vos propres contrats. N'y stockez pas les données d'un tiers sans son accord, ni de contenu illicite.",
            "Les tentatives de surcharge, d'intrusion ou d'extraction automatisée du service ne sont pas autorisées.",
          ],
        },
        {
          title: "Vos données",
          body: [
            "Le contenu que vous saisissez reste le vôtre. Le traitement qui en est fait est décrit sur la page Confidentialité.",
          ],
        },
        {
          title: "Responsabilité",
          body: [
            "Le service est fourni en l'état, sans garantie. Les calculs affichés — totaux, dates de prélèvement, échéances à venir — sont indicatifs et dérivés de ce que vous avez saisi. Une erreur de saisie produit un résultat faux.",
          ],
        },
        {
          title: "Évolution de ces conditions",
          body: [
            "Ces conditions évolueront avec l'application. La date de mise à jour en haut de page fait foi.",
          ],
        },
      ]}
    />
  );
}
