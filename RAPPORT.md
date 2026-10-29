# Klarity — rapport sur l'application

*État au 29 octobre 2026, branche `develop` (21 commits d'avance sur `master`).*

Klarity centralise les contrats et abonnements du quotidien (assurances,
énergie, télécom, streaming, crédits…) et montre ce qui sera prélevé, et quand.
Usage individuel : chaque compte ne voit que ses propres données, sans partage.
Rien n'est importé automatiquement : pas de connexion bancaire, pas de lecture
de relevés.

---

## 1. Fonctionnalités actuelles

### Compte et connexion
- Inscription par e-mail et mot de passe (12 caractères minimum, 72 octets
  maximum). Le compte n'est actif qu'après ouverture du lien de confirmation
  reçu par e-mail, valable 24 h et renvoyable depuis la page de connexion.
- Connexion avec Google. Elle se raccorde à un compte e-mail existant portant
  la même adresse.
- « Mot de passe oublié » : lien valable 1 h, à usage unique.
- Changement de mot de passe dans les réglages. Il ferme toutes les sessions
  ouvertes.
- « Se déconnecter de tous les appareils ».
- Export des données au format JSON et suppression du compte en libre-service.

### Contrats
- Création, modification, archivage et restauration, suppression.
- Champs : nom, fournisseur (optionnel), catégorie, montant, fréquence
  (mensuelle, trimestrielle, annuelle), jour de prélèvement, mois de référence
  pour les fréquences trimestrielle et annuelle, date de renouvellement,
  référence du contrat.
- Le formulaire montre un aperçu en direct sur ordinateur.
- Fiche détail d'un contrat accessible depuis les listes.

### Échéances (`/calendar`, écran principal)
- Trois listes : **À venir**, **Ce mois-ci**, **Tout**.
- Deux vues : liste, ou calendrier mensuel avec les prélèvements de chaque jour.
- Horizon de 3, 6 ou 12 mois. Chaque mois a une hauteur fixe et défile
  indépendamment des autres.
- Filtres par catégorie et par fournisseur depuis le menu de gauche (sections
  dépliables). Les filtres sont portés par l'URL, donc partageables et
  conservés au rechargement.
- Synthèse : total sur la période et part du mois déjà prélevée.

### Tableau de bord (`/tableau-de-bord`)
- Indicateurs : coût mensuel lissé, coût annuel, nombre de contrats actifs,
  montant restant à prélever ce mois-ci.
- Diagramme de Sankey qui répartit le coût mensuel par catégorie puis par
  fournisseur.
- Prélèvements mois par mois, répartition par catégorie, distribution des
  prélèvements dans le mois, renouvellements à venir ou dépassés, postes les
  plus lourds.

### Réglages (`/reglages`)
- **Contrats** : filtre par statut, tri, modification, archivage, suppression.
- **Catégories** : création, renommage, couleur, suppression avec choix de la
  catégorie qui récupère les contrats.
- **Fournisseurs** : renommage, fusion de deux fournisseurs.
- **Compte** : mot de passe, sessions, export, suppression.

### Transverse
- Thème clair et sombre, interface adaptée au mobile (navigation dédiée).
- Pages publiques : Support, Conditions d'utilisation (bêta), Confidentialité
  (RGPD), Mentions légales.
- Journal structuré des erreurs serveur et des plantages navigateur, visible
  dans les logs Vercel.

---

## 2. Stack technique

| Domaine | Choix |
| --- | --- |
| Framework | Next.js 15.5 (App Router, Turbopack), React 19.1, TypeScript 5 |
| Interface | MUI 7 avec variables CSS (thème clair/sombre par classe), Emotion, d3-sankey |
| Authentification | NextAuth 4 en stratégie JWT : identifiants (bcrypt, coût 12) et Google, adaptateur Prisma |
| Données | Prisma 6, PostgreSQL chez Neon (connexion poolée à l'exécution, directe pour les migrations) |
| Validation | zod 4 |
| E-mails | API HTTP Resend, appelée avec `fetch` sans SDK |
| Tests | Vitest 4, happy-dom, Testing Library (23 fichiers, 178 tests) |
| Qualité | ESLint 9 (`eslint-config-next`), `tsc` |
| Hébergement | Vercel pour l'application, Neon pour la base |

---

## 3. Organisation du code

```
src/
├─ app/          Pages et routes HTTP (App Router)
├─ modules/      Logique métier par domaine
├─ components/   Composants d'interface, rangés par écran
├─ lib/          Briques transverses
├─ middleware.ts Protection des pages par session
└─ instrumentation.ts  Remontée des erreurs serveur
prisma/          Schéma, migrations, données de démo
```

**Comment les couches s'articulent**

1. **`src/app`** : les pages sont des composants serveur. Elles lisent la
   session, appellent les requêtes de `modules/*/queries.ts` et passent les
   données aux composants clients. Le dossier contient aussi trois routes API :
   l'authentification NextAuth et l'inscription, l'export du compte, la
   réception des erreurs navigateur.
2. **`src/modules`** : le cœur de l'application, découpé par domaine.
   - `contracts` : actions serveur (créer, modifier, archiver, supprimer),
     requêtes, et calculs purs testés unitairement (`calendar.ts`, `dashboard.ts`,
     `sidebar.ts`).
   - `categories` : catégories et fournisseurs (renommer, fusionner).
   - `auth` : inscription, vérification d'adresse, jetons à usage unique, mots
     de passe.
   - `account` : suppression du compte, révocation des sessions.

   Chaque action serveur vérifie la session et que le contrat appartient bien
   à l'utilisateur.
3. **`src/components`** : `echeances`, `dashboard`, `settings`, `contracts`
   (formulaire, fiche), `layout` (menu latéral, navigation mobile), `ui`
   (styles de surface partagés du design system : `cardSx`, `scrollBoxSx`…),
   `providers` (thème, notifications).
4. **`src/lib`** :
   - `auth.ts` : configuration NextAuth ;
   - `sessionToken.ts` : révocation des sessions ;
   - `rateLimit.ts` : limiteur stocké en base ;
   - `mailer.ts` : envoi des e-mails ;
   - `errorLog.ts` et `reportError.ts` : journal d'erreurs ;
   - `theme.ts` : jetons du design system ;
   - `db.ts` : client Prisma.

**Modèle de données** (`prisma/schema.prisma`)
- `User`, avec `tokenVersion` qui sert à révoquer les sessions.
- `Account` et `Session` : tables NextAuth.
- `VerificationToken` : jetons stockés sous forme d'empreinte.
- `Contract`.
- `Category` : propre à chaque utilisateur. Le contrat référence la catégorie
  par son slug, si bien qu'une catégorie supprimée renvoie ses contrats en
  « sans catégorie ».
- `RateLimitHit` : empreintes SHA-256, purgées au bout de 24 h.

---

## 4. Déploiement

- **Hébergement** : Vercel pour l'application, Neon pour PostgreSQL.
- **Build** : `npm run build` lance `prisma generate`, puis `prisma migrate deploy`,
  puis `next build`. Les migrations s'appliquent donc à chaque déploiement, sur
  la base pointée par `DATABASE_URL_UNPOOLED`.
  ⚠️ Un build lancé en local migre la base configurée dans `.env`.
- **Branches** :
  - le travail se fait sur des branches `feat-xxx` ou `fix-xxx` tirées de `develop` ;
  - elles sont fusionnées dans `develop` avec `--no-ff` ;
  - `develop` passe ensuite sur `master`, la branche principale.
- **Variables d'environnement** :

  | Variable | Rôle |
  | --- | --- |
  | `DATABASE_URL` | Connexion poolée, à l'exécution |
  | `DATABASE_URL_UNPOOLED` | Connexion directe, pour les migrations |
  | `NEXTAUTH_URL` | URL publique, utilisée aussi pour les liens des e-mails |
  | `NEXTAUTH_SECRET` | Signature des sessions |
  | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Connexion Google |
  | `RESEND_API_KEY`, `EMAIL_FROM` | E-mails. `EMAIL_FROM` doit appartenir à un domaine vérifié chez Resend |

  En production, l'application refuse de démarrer sans `NEXTAUTH_SECRET` ni
  identifiants Google, et l'envoi d'un e-mail échoue si les variables Resend
  manquent. En développement, sans clé Resend, les e-mails s'affichent dans la
  console.
- **Migrations en attente** : 4 migrations ne sont pas encore appliquées en
  production :
  - `add_rate_limit_hits` ;
  - `add_user_token_version` ;
  - `verify_existing_accounts`, qui marque comme vérifiés les comptes existants
    ayant un mot de passe, pour qu'ils ne soient pas bloqués à la connexion ;
  - `drop_legacy_contract_columns`, qui recopie `monthly_amount` dans `amount`
    pour les anciens contrats sans montant, puis supprime `monthly_amount`,
    `annual_amount`, `icon_type` et `icon_value`.
- **Supervision** : les erreurs sont écrites en JSON sur une ligne dans les logs
  Vercel (`"level":"error"`), sans paramètres d'URL, jetons ni e-mails.

---

## 5. Compte rendu de l'audit de sécurité

### Périmètre
- Gestion des mots de passe et des sessions.
- Fuites mémoire.
- Conformité RGPD.
- Dépendances.
- Bugs divers.

Méthode : lecture du code, `npm audit`, puis tests automatisés pour chaque
correction. Aucun test d'intrusion ni test de bout en bout dans un navigateur
n'a été mené.

### Constats et corrections

| # | Constat | Gravité | Statut |
| --- | --- | --- | --- |
| 1 | Next.js vulnérable (faille critique connue) | Critique | ✅ Next 15.5.28, zod et sharp mis à jour |
| 2 | Inscription sans vérification d'adresse : n'importe qui pouvait occuper l'adresse d'un autre | Élevée | ✅ Confirmation obligatoire par e-mail. Un compte jamais vérifié peut être réécrit, et son mot de passe est effacé si le titulaire se connecte avec Google |
| 3 | Aucune réinitialisation de mot de passe, aucun changement de mot de passe | Élevée | ✅ « Mot de passe oublié » (lien 1 h, usage unique, seule l'empreinte est stockée) et changement depuis les réglages |
| 4 | Sessions JWT impossibles à révoquer, y compris après suppression du compte | Élevée | ✅ `tokenVersion` vérifié à chaque requête. Révocation au changement ou à la réinitialisation du mot de passe, et sur demande |
| 5 | Limiteur de tentatives en mémoire : inefficace sur plusieurs instances, et la table grossissait sans limite (**fuite mémoire**) | Élevée | ✅ Limiteur stocké en Postgres, clés sous forme d'empreinte, purge après 24 h |
| 6 | Le limiteur sur l'e-mail seul permettait à un tiers de bloquer un compte | Moyenne | ✅ Clés par e-mail + IP (10/15 min), par compte (100/h) et par IP (30/15 min) |
| 7 | Énumération des comptes : l'inscription disait « adresse déjà utilisée », et la connexion répondait plus vite pour une adresse inconnue | Moyenne | ✅ Réponse identique dans tous les cas (inscription, mot de passe oublié, renvoi du lien) et bcrypt exécuté même sans compte |
| 8 | Règle de mot de passe faible (8 caractères), et bcrypt ignore silencieusement au-delà de 72 octets | Moyenne | ✅ 12 caractères minimum, 72 octets maximum |
| 9 | Politique de confidentialité incomplète, mentions légales absentes | Moyenne (RGPD) | ✅ Pages réécrites (articles 13 et 14 du RGPD). ⚠️ 3 mentions entre crochets restent à remplir |
| 10 | Aucune visibilité sur les erreurs en production | Moyenne | ✅ Journal structuré côté serveur et côté navigateur, avec limitation et nettoyage des données |
| 11 | Deux alertes « élevées » dans des dépendances de build (`deepmerge-ts` via Prisma, `postcss` via Next) | Faible (pas exécutées en production) | ⏳ Correction possible seulement par une mise à jour majeure |

### Points déjà solides avant l'audit
- Chaque action serveur vérifie la session et que la donnée appartient à
  l'utilisateur. La route d'export vérifie elle-même la session, car le
  middleware ne couvre pas `/api`.
- Mots de passe hachés avec bcrypt (coût 12) et adresses e-mail normalisées en
  minuscules.
- En-têtes de sécurité :
  - CSP stricte, avec une exception `unsafe-inline` documentée ;
  - `X-Frame-Options: DENY` et `nosniff` ;
  - `Referrer-Policy` et `Permissions-Policy`.
- RGPD :
  - export et suppression du compte en libre-service, avec suppression en
    cascade ;
  - un seul cookie, celui de session, strictement nécessaire ;
  - aucun traceur.

### Fuites mémoire
La seule fuite identifiée était le limiteur en mémoire (constat 5), corrigée.
Aucun écouteur ni minuteur laissé actif dans les composants clients n'a été
relevé à la lecture du code. Ce point n'a pas été vérifié par un profilage.

### Verdict
**Bêta publique possible** une fois les trois préalables ci-dessous faits :
1. définir les variables Resend sur Vercel ;
2. compléter les mentions juridiques ;
3. vérifier les migrations sur une branche Neon.

Les points restants sont des améliorations qui ne bloquent pas l'ouverture.

---

## 6. Tâches restantes

### Avant d'ouvrir la bêta
- [ ] Définir `RESEND_API_KEY` et `EMAIL_FROM` (domaine vérifié chez Resend) dans les variables Vercel
- [ ] Compléter l'adresse de l'éditeur dans les Mentions légales
- [ ] Compléter les régions d'hébergement Vercel et Neon dans la page Confidentialité
- [ ] Compléter la durée de rétention des sauvegardes Neon dans la page Confidentialité
- [ ] Tester les 4 migrations sur une branche Neon copiée de la production avant de déployer
- [ ] Tester de bout en bout sur une préproduction : inscription, e-mail de confirmation, connexion, mot de passe oublié, changement de mot de passe, déconnexion de tous les appareils, connexion Google sur un compte e-mail existant
- [ ] Vérifier dans les logs Vercel qu'une erreur volontaire remonte bien au format JSON
- [ ] Ouvrir la pull request `develop` → `master` et déployer

### Sécurité et robustesse
- [ ] Mettre à jour Prisma et Next en version majeure pour supprimer les 2 alertes `npm audit` restantes (`deepmerge-ts`, `postcss`)
- [ ] Ajouter des tests de contrôle d'accès : un utilisateur ne peut ni lire, ni modifier, ni supprimer le contrat ou la catégorie d'un autre
- [ ] Passer la CSP à des nonces pour retirer `unsafe-inline` des scripts
- [ ] Surveiller les blocages au niveau compte (100 tentatives/h) : un attaquant distribué peut encore ralentir un compte ciblé
- [ ] Remplacer l'adresse Gmail de support par une adresse sur le domaine de l'application

### Données et calculs
- [ ] Stocker les montants en `Decimal` (ou en centimes entiers) au lieu de `Float` pour éviter les erreurs d'arrondi
- [ ] Ajouter un index sur `contracts.user_id`, utilisé par toutes les requêtes
- [ ] Gérer le fuseau horaire de l'utilisateur : « aujourd'hui » et le mois en cours sont calculés dans le fuseau du serveur (UTC sur Vercel)
- [x] Supprimer par migration les colonnes `icon_type` et `icon_value` de `contracts`, que plus rien n'utilise depuis le retrait des icônes
- [x] Ne plus utiliser les colonnes héritées `monthly_amount` et `annual_amount`, encore écrites et lues en repli de `amount`, puis les supprimer
- [ ] Décider du sort des colonnes `client_phone`, `website`, `advisor_name`, `notes` et `end_date` de `contracts` : aucun écran ne les affiche ni ne les modifie, et l'export ne les inclut pas. Les supprimer, ou les ajouter au formulaire et à l'export (RGPD : une donnée conservée doit être exportable)

### Ménage du dépôt
- [x] Mettre à jour le README : il décrit encore le limiteur « en mémoire » et ne mentionne pas les variables Resend
- [ ] Retirer du dépôt, ou ignorer, les dossiers de travail `claude/` et `design/` ainsi que `.claude/test-results-edit-contrat.md`
- [x] Nettoyer `src/modules/contracts/types.ts` (type `statsType` hérité, utilisé nulle part) et supprimer `getContratsStats` dans `queries.ts`, jamais appelée et fausse (elle ignore les contrats trimestriels et annuels)
