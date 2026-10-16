import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Uses the edge-safe config only: importing auth.ts here would load Prisma,
// which can't run in the middleware's edge runtime.
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
