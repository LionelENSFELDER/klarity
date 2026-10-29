import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { checkPassword } from "@/modules/auth/checkPassword";
import { prisma } from "./db";
import { normalizeEmail } from "./email";
import { clientIp, isLimited, recordAttempt } from "./rateLimit";
import { EMAIL_NOT_VERIFIED, TOO_MANY_ATTEMPTS } from "./messages";
import { resolveToken } from "./sessionToken";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

// En production, une variable manquante doit casser le démarrage, pas la
// première connexion d'un utilisateur.
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value ?? "";
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: requireEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
      // Google garantit la possession de l'adresse (vérifié dans signIn) :
      // un compte e-mail existant peut être relié au lieu d'être bloqué.
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Trois compteurs, seuls les échecs comptent :
        // - compte + IP : freine l'essai de mots de passe depuis une source,
        //   sans qu'un inconnu puisse bloquer le compte de quelqu'un d'autre
        //   (le titulaire, depuis son IP, garde son propre compteur) ;
        // - IP : freine l'essai d'adresses en série ;
        // - compte, plus large : freine une attaque répartie sur de
        //   nombreuses IP.
        // NextAuth transmet le message levé.
        const email = normalizeEmail(credentials.email as string);
        const ip = clientIp(req?.headers);
        const keys: [string, number, number][] = [
          [`login:${email}:${ip ?? "?"}`, 10, FIFTEEN_MINUTES],
          [`login-account:${email}`, 100, ONE_HOUR],
        ];
        if (ip) keys.push([`login-ip:${ip}`, 30, FIFTEEN_MINUTES]);
        const limited = await Promise.all(keys.map(([k, max, win]) => isLimited(k, max, win)));
        if (limited.some(Boolean)) {
          throw new Error(TOO_MANY_ATTEMPTS);
        }
        const fail = async () => {
          await Promise.all(keys.map(([k]) => recordAttempt(k)));
          return null;
        };

        // Même normalisation qu'à l'inscription : l'index unique de
        // Postgres est sensible à la casse.
        const user = await prisma.user.findUnique({
          where: { email },
        });

        // Toujours une comparaison bcrypt, compte ou pas : le temps de
        // réponse ne trahit pas les adresses inscrites.
        const isPasswordValid = await checkPassword(
          credentials.password as string,
          user?.password,
        );

        if (!user || !isPasswordValid) {
          return fail();
        }

        // Après le mot de passe : un inconnu n'apprend rien sur le compte.
        if (!user.emailVerified) {
          throw new Error(EMAIL_NOT_VERIFIED);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    // Connexion Google sur une adresse qui a déjà un compte e-mail : Google
    // prouve la possession de l'adresse. Un compte jamais vérifié a pu être
    // créé par un tiers : son mot de passe est retiré et ses sessions fermées.
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      const google = profile as { email?: string; email_verified?: boolean } | undefined;
      if (!google?.email || google.email_verified === false) return false;

      const existing = await prisma.user.findUnique({
        where: { email: normalizeEmail(google.email) },
      });
      if (existing && !existing.emailVerified) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { emailVerified: new Date(), password: null, tokenVersion: { increment: 1 } },
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    // Relit la version de session en base à chaque lecture : une session
    // révoquée ou un compte supprimé ne passe plus (voir sessionToken).
    async jwt({ user, token }) {
      return resolveToken(token, user?.id, async (id) => {
        const found = await prisma.user.findUnique({
          where: { id },
          select: { tokenVersion: true },
        });
        return found?.tokenVersion ?? null;
      });
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: requireEnv("NEXTAUTH_SECRET"),

  // Debug
  debug: process.env.NODE_ENV === "development",
};

// Types pour TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
