import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales — Klarity",
};

// Informations exigées par l'article 6 de la loi pour la confiance dans
// l'économie numérique (LCEN). Les mentions entre crochets restent à remplir.
export default function MentionsLegalesPage() {
  return (
    <LegalPage
      title="Mentions légales"
      updatedAt="29 octobre 2026"
      intro="Qui édite Klarity, qui l'héberge, et comment nous joindre."
      sections={[
        {
          title: "Éditeur",
          body: [
            "Klarity est édité à titre personnel par Lionel Ensfelder.",
            "Adresse : [à compléter : adresse postale de l'éditeur].",
            "Contact : ensfelder.lionel+klarity@gmail.com.",
            "Directeur de la publication : Lionel Ensfelder.",
          ],
        },
        {
          title: "Hébergement",
          body: [
            "Application : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com.",
            "Base de données : Neon (groupe Databricks) — neon.com.",
          ],
        },
        {
          title: "Données personnelles",
          body: [
            "Le traitement de vos données est décrit sur la page Confidentialité.",
          ],
        },
      ]}
    />
  );
}
