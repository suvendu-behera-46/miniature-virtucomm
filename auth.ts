import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        if (!email || !password) {
          return null;
        }

        const user = await prisma.adminUser.findUnique({
          where: { email },
        });

        if (!user || !user.active) {
          return null;
        }

        const valid = await compare(password, user.password);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    ...(googleClientId && googleClientSecret
      ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.trim().toLowerCase();
      if (!email) return false;

      const name = user.name?.trim() || email.split("@")[0];
      const customer = await prisma.customer.upsert({
        where: { email },
        create: { email, name },
        update: {},
        select: { id: true },
      });

      user.id = customer.id;
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: string }).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      const sessionUser = session.user as typeof session.user & {
        id?: string;
        role?: string | null;
      };

      if (sessionUser) {
        sessionUser.id = token.sub ?? "";
        sessionUser.role = (token.role as string | undefined) ?? "ADMIN";
      }

      return session;
    },
  },
});
