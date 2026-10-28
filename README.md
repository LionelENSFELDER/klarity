# Klarity

Centralise tes contrats et abonnements (assurances, énergie, télécom,
streaming, crédits…) et montre ce qui sera prélevé, et quand.

Next.js 15 (App Router) · React 19 · MUI 7 · NextAuth 4 · Prisma 6 · Postgres (Neon) · Vitest 4

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner les valeurs, voir ci-dessous
npm run db:setup       # génère le client Prisma, applique les migrations, insère les données de démo
npm run dev            # http://localhost:3000
```

### Variables d'environnement

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion Postgres poolée (runtime) |
| `DATABASE_URL_UNPOOLED` | Connexion directe, pour les migrations |
| `NEXTAUTH_URL` | URL publique de l'app (`http://localhost:3000` en local) |
| `NEXTAUTH_SECRET` | Secret de signature des sessions (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Connexion avec Google |

En production, l'app refuse de démarrer si `NEXTAUTH_SECRET` ou les
identifiants Google manquent.

> ⚠️ `npm run build` exécute `prisma migrate deploy` sur la base pointée par
> `DATABASE_URL_UNPOOLED`. Vérifie que ton `.env` local ne pointe pas sur la
> base de production avant de lancer un build, ou utilise une branche Neon.

## Scripts

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm test` | Tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run build` | Migrations + build de production |
| `npm run db:migrate` | Crée et applique une migration en local |
| `npm run db:studio` | Explorateur de la base |
| `npm run db:reset` | Vide la base et réinsère les données de démo |

## Organisation

- `src/app` : pages et routes (`/calendar`, `/tableau-de-bord`, `/reglages`, `/support`, API d'auth et d'export).
- `src/modules` : logique métier par domaine (`contracts`, `categories`, `auth`, `account`) — actions serveur, requêtes, calculs purs testés.
- `src/components` : composants d'interface, rangés par écran.
- `src/lib` : auth, Prisma, thème, limitation des tentatives, messages partagés.

## Sécurité

- Les actions serveur vérifient la session et la propriété de chaque contrat.
- Connexion et inscription sont limitées en nombre de tentatives (en mémoire, par instance : voir `src/lib/rateLimit.ts`).
- En-têtes de sécurité et CSP dans `next.config.ts`.
- Export et suppression du compte en libre-service (Réglages › Compte).
