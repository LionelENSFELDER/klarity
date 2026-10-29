import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Confidentialité — Klarity",
};

// Informations exigées par les articles 13 et 14 du RGPD. Les mentions
// entre crochets dépendent de la configuration de production et restent à
// vérifier avant ouverture.
export default function ConfidentialitePage() {
  return (
    <LegalPage
      title="Confidentialité"
      updatedAt="29 octobre 2026"
      intro="Klarity sert à suivre vos contrats et prélèvements. Cette page décrit les données que l'application conserve, pourquoi, chez qui, combien de temps, et comment vous en reprenez le contrôle."
      sections={[
        {
          title: "Responsable du traitement",
          body: [
            "Lionel Ensfelder, éditeur de Klarity (voir Mentions légales). Contact : ensfelder.lionel+klarity@gmail.com.",
          ],
        },
        {
          title: "Données de compte",
          body: [
            "À la création du compte : votre adresse e-mail, votre nom, et — si vous passez par Google — la photo de profil associée. Le mot de passe est stocké sous forme d'empreinte bcrypt, jamais en clair.",
            "Pour la sécurité du compte : la date de vérification de votre adresse, des liens à usage unique (vérification, mot de passe oublié) dont seule l'empreinte est conservée jusqu'à leur expiration, et un numéro de version de session qui permet de fermer vos sessions à distance.",
          ],
        },
        {
          title: "Données de contrats",
          body: [
            "Tout ce que vous saisissez : nom du contrat, fournisseur, catégorie, montant, fréquence, jour de prélèvement, date de renouvellement et référence.",
            "Ces données ne sont rattachées qu'à votre compte. Klarity ne se connecte à aucune banque et ne lit aucun relevé : rien n'est importé automatiquement.",
          ],
        },
        {
          title: "Données techniques",
          body: [
            "Pour limiter les tentatives de connexion et d'inscription abusives, Klarity enregistre chaque échec avec l'heure. L'adresse e-mail et l'adresse IP concernées n'y figurent que sous forme d'empreinte (SHA-256) ; ces traces sont effacées au bout de 24 heures.",
            "L'hébergeur conserve des journaux techniques (adresse IP, page demandée, heure) pour faire fonctionner et sécuriser le service.",
          ],
        },
        {
          title: "Finalités et base légale",
          body: [
            "Vos données servent uniquement à fournir le service que vous utilisez : afficher vos échéances, calculer vos totaux, vous connecter. Base légale : l'exécution du contrat qui vous lie à Klarity (article 6.1.b du RGPD).",
            "La limitation des tentatives et les journaux techniques reposent sur l'intérêt légitime à sécuriser le service (article 6.1.f).",
            "Aucune publicité, aucun profilage, aucune revente.",
          ],
        },
        {
          title: "Destinataires et sous-traitants",
          body: [
            "Vercel (hébergement de l'application), Neon (base de données), Resend (envoi des e-mails de vérification et de réinitialisation) et, si vous l'utilisez, Google (connexion).",
            "Région d'hébergement : [à compléter : région Vercel et région Neon de production, par exemple Francfort (UE)].",
            "Ces prestataires sont des sociétés américaines : un transfert hors de l'Union européenne peut avoir lieu. Il est encadré par les clauses contractuelles types de la Commission européenne et, pour les sociétés certifiées, par le Data Privacy Framework UE–États-Unis.",
          ],
        },
        {
          title: "Durée de conservation",
          body: [
            "Vos données sont conservées tant que le compte existe. La suppression d'un contrat l'efface de la base ; la suppression du compte efface immédiatement le compte, ses contrats et ses catégories.",
            "Les sauvegardes de la base gardent une copie des données effacées pendant [à compléter : durée de rétention des sauvegardes Neon], puis elles disparaissent.",
          ],
        },
        {
          title: "Cookies",
          body: [
            "Klarity n'utilise qu'un cookie de session, strictement nécessaire pour rester connecté : il n'exige pas de consentement. Le choix du thème clair ou sombre est gardé dans votre navigateur. Aucun cookie de mesure d'audience ni de publicité.",
          ],
        },
        {
          title: "Vos droits",
          body: [
            "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition. L'export de vos données (JSON) et la suppression de votre compte se font en libre-service dans Réglages › Compte ; pour le reste, écrivez à l'adresse ci-dessus. Réponse sous un mois.",
            "Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (cnil.fr).",
          ],
        },
      ]}
    />
  );
}
