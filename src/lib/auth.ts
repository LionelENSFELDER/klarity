import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { normalizeEmail } from "./email";
import { clientIp, isLimited, recordAttempt } from "./rateLimit";
import { TOO_MANY_ATTEMPTS } from "./messages";

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

        if (!user || !user.password) {
          return fail();
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return fail();
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
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
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
