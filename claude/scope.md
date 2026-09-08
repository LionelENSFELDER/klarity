# Spécifications fonctionnelles — Klarity

**Application de gestion administrative personnelle**
Version : brouillon v0.1 — issu des échanges de cadrage

---

## 1.1 Contexte et objectif

Klarity est une application web qui centralise les contrats et abonnements du quotidien (assurances, énergie, télécom, streaming, crédits, etc.) pour répondre à deux besoins :

1. **Retrouver en un clic** les informations d'un contrat donné (référence, montant, échéance, numéro de contact, document).
2. **Visualiser sur un calendrier** les dates de prélèvement de l'ensemble des souscriptions, afin d'anticiper les sorties d'argent du mois.

Principe directeur : rester simple et pratique — pas d'usine à gaz. Chaque écran doit répondre à un besoin précis, sans fonctionnalités superflues.

## 1.2 Stack technique

Utilise la stack technique actuelle (voir package.json).

---

## 2. Utilisateurs cibles

- Usage individuel (pas de notion multi-utilisateur / partage prévue à ce stade).
- Utilisateur souhaitant garder une vue d'ensemble de ses charges récurrentes sans dépendre d'un tableur.

---

## 3. Périmètre fonctionnel

### 3.1 Vue Calendrier (écran principal)

**Objectif** : donner une vision mensuelle des prélèvements à venir.

**Contenu de l'écran :**

- En-tête avec nom de l'application, navigation mois précédent / mois suivant.
- Bandeau de synthèse : total prélevé sur le mois affiché, légende des catégories (pastille de couleur par type de contrat).
- Grille calendrier (semaine du lundi au dimanche) :
  - Chaque jour affiche une pastille de couleur par contrat prélevé ce jour-là (empilées si plusieurs).
  - Le montant total du jour est affiché en petit, sous les pastilles.
  - Le jour courant est mis en évidence visuellement.

**Interaction :**

- Clic sur un jour → ouverture d'un panneau latéral listant les contrats prélevés ce jour-là.
- Si aucun prélèvement ce jour-là : message d'état vide ("Aucun prélèvement").

### 3.2 Panneau détail d'un jour

**Objectif** : accéder en un clic supplémentaire au détail d'un contrat.

**Contenu :**

- Date sélectionnée en en-tête.
- Liste des contrats prélevés ce jour (nom, catégorie, montant).
- Clic sur un contrat → dépliage des informations : référence contrat, fréquence, date de renouvellement / échéance, bouton "Voir le contrat" et bouton de téléchargement du document associé.

### 3.3 Vue Ajout d'un contrat / abonnement

**Objectif** : permettre la saisie rapide d'un nouveau contrat pour qu'il apparaisse automatiquement dans le calendrier.

**Champs du formulaire :**

| Champ                             | Obligatoire | Description                                                                                                                                                          |
| --------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fournisseur / nom du contrat      | Oui         | Texte libre (ex. "MAAF Habitation")                                                                                                                                  |
| Catégorie                         | Oui         | Sélection unique parmi une liste de catégories prédéfinies (habitation, auto, santé, énergie, internet & mobile, abonnement, crédit), chacune associée à une couleur |
| Montant                           | Oui         | Montant du prélèvement, en euros                                                                                                                                     |
| Fréquence                         | Oui         | Une fois / Mensuel / Trimestriel / Annuel                                                                                                                            |
| Jour de prélèvement               | Oui         | Fréquence récurrente : sélection du jour du mois (1 à 31) via une mini-grille. Fréquence "une fois" : sélection de la date complète du prélèvement                   |
| Référence contrat                 | Non         | Texte libre                                                                                                                                                          |
| Date de renouvellement / échéance | Non         | Date                                                                                                                                                                 |
| Document du contrat               | Non         | Import de fichier (PDF)                                                                                                                                              |

**Interaction :**

- Aperçu en temps réel de l'entrée telle qu'elle apparaîtra dans le calendrier (pastille + montant), affiché avant validation.
- Bouton de validation ("Ajouter au calendrier") désactivé tant que les champs obligatoires ne sont pas renseignés.
- Bouton d'annulation pour fermer sans enregistrer.

---

## 4. Catégories de contrats (référentiel initial)

| Catégorie              | Exemples                |
| ---------------------- | ----------------------- |
| Assurance habitation   | MAAF, etc.              |
| Assurance auto         | MAIF, etc.              |
| Mutuelle santé         | Alan, etc.              |
| Énergie                | EDF, etc.               |
| Internet & mobile      | Free, etc.              |
| Abonnement / streaming | Netflix, Spotify, etc.  |
| Crédit                 | Crédit immobilier, etc. |

Chaque catégorie est associée à une couleur distinctive, réutilisée de façon cohérente entre la vue calendrier et la vue d'ajout.

---

## 5. Éléments de données par contrat

- Nom / fournisseur
- Catégorie
- Montant
- Fréquence de prélèvement (une fois, mensuel, trimestriel, annuel)
- Jour du mois de prélèvement (ou date complète pour un prélèvement unique)
- Référence contrat (optionnel)
- Date de renouvellement / échéance (optionnel)
- Document associé (optionnel)

---

## 6. Identité visuelle (rappel de la direction retenue)

- **Thème** : fond sombre, cohérent avec les maquettes validées.
- **Accent** : dégradé violet → bleu, utilisé pour les éléments actifs et les actions principales.
- **Typographies** : une police display (titres, chiffres de calendrier), une police courante (texte), une police monospace pour les montants.
- **Signature visuelle** : pastilles de couleur par catégorie, reprises à l'identique entre le calendrier et le formulaire d'ajout, et aperçu live dans le formulaire pour relier les deux écrans.

---

## 7. Hors périmètre à ce stade

- Gestion multi-utilisateur / partage de contrats.
- Notifications / rappels avant prélèvement.
- Modification ou suppression d'un contrat existant (seule la création a été spécifiée).
- Vue "liste" complémentaire au calendrier.
- Intégration technique (stack retenue à confirmer : React/TypeScript en frontend, Go et PostgreSQL en backend, évoqués mais non figés).

---

## 8. Maquettes de référence

Deux vues ont été prototypées :

1. `reglo-calendrier.jsx` — vue calendrier principale avec panneau de détail.
2. `reglo-ajout-contrat.jsx` — vue de création d'un contrat.

Ces fichiers servent de base visuelle et interactive pour le développement.
