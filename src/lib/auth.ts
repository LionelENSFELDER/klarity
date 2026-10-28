import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { normalizeEmail } from "./email";
import { allowAttempt, clientIp } from "./rateLimit";
import { TOO_MANY_ATTEMPTS } from "./messages";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

        // Par compte (essai de mots de passe sur une adresse) et par IP
        // (essai d'adresses en série). NextAuth transmet le message levé.
        const email = normalizeEmail(credentials.email as string);
        const ip = clientIp(req?.headers);
        if (
          !allowAttempt(`login:${email}`, 10, FIFTEEN_MINUTES) ||
          (ip && !allowAttempt(`login-ip:${ip}`, 30, FIFTEEN_MINUTES))
        ) {
          throw new Error(TOO_MANY_ATTEMPTS);
        }

        // Même normalisation qu'à l'inscription : l'index unique de
        // Postgres est sensible à la casse.
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          return null;
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

  secret: process.env.NEXTAUTH_SECRET,

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
