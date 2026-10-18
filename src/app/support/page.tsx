import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Support — Klarity",
};

export default function SupportPage() {
  return (
    <LegalPage
      title="Support"
      updatedAt="18 octobre 2026"
      intro="Klarity est en alpha : les bugs font partie du décor. Voici quoi faire quand quelque chose coince."
      sections={[
        {
          title: "Avant de signaler",
          body: [
            "Rechargez la page : l'essentiel de l'affichage est recalculé à chaque chargement, ce qui suffit souvent.",
            "Vérifiez la saisie du contrat concerné — fréquence, jour de prélèvement, mois de référence pour un contrat trimestriel ou annuel. Une échéance qui n'apparaît pas vient le plus souvent de là.",
            "Une échéance annuelle n'est visible que si l'horizon est assez large : passez le sélecteur à 12 mois.",
          ],
        },
        {
          title: "Signaler un problème",
          body: [
            "Indiquez ce que vous faisiez, ce que vous attendiez, et ce qui s'est passé à la place. Une capture d'écran et le nom du contrat concerné suffisent dans la plupart des cas.",
            "Canal de contact à définir — il sera indiqué ici.",
          ],
        },
        {
          title: "Demandes sur vos données",
          body: [
            "Export ou suppression de compte : la demande passe par le même canal, en attendant que ces actions soient disponibles directement dans l'application.",
          ],
        },
        {
          title: "Limites connues",
          body: [
            "L'import de documents PDF a été retiré : les fichiers étaient stockés sans qu'aucun écran ne permette de les relire. La fonctionnalité reviendra avec une vraie consultation.",
            "Aucune notification n'est encore envoyée avant une échéance : la cloche de l'interface est un emplacement réservé.",
          ],
        },
      ]}
    />
  );
}
