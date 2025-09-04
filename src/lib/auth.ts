import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  callbacks: {
    session: ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    jwt: ({ user, token }) => {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },

  session: {
    strategy: "jwt",
  },

  // Debug en développement
  debug: process.env.NODE_ENV === "development",
});

// Types pour TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
