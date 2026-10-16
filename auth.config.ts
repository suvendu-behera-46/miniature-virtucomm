import type { NextAuthConfig } from "next-auth";

// Edge-safe part of the Auth.js config, shared by auth.ts and the middleware.
// The middleware runs in the edge runtime, where Prisma can't start, so nothing
// here may touch the database; providers that need it are added in auth.ts.
export const authConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [],
  callbacks: {
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
} satisfies NextAuthConfig;
