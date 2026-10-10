import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export const adminRoles = ["SUPER_ADMIN", "ADMIN", "SALES", "DESIGNER", "PRODUCTION"] as const;
export type AdminRole = (typeof adminRoles)[number];

export type AdminSession = { id: string; email: string; name: string; role: AdminRole };

// Every admin page and Server Action must call this: Server Actions are
// reachable by direct POST, so the layout's redirect alone is not enough.
export async function requireAdmin(options?: { superAdmin?: boolean }): Promise<AdminSession> {
  const session = await auth();
  const user = session?.user as (NonNullable<typeof session>["user"] & { id?: string; role?: string }) | undefined;

  if (!user?.id || !adminRoles.includes(user.role as AdminRole)) {
    redirect("/admin/login");
  }

  // Re-read the account so deactivation and role changes apply immediately,
  // not only when the session token expires.
  const account = await prisma.adminUser.findUnique({ where: { id: user.id }, select: { name: true, email: true, role: true, active: true } });
  if (!account?.active) redirect("/admin/login");
  if (options?.superAdmin && account.role !== "SUPER_ADMIN") {
    throw new Error("Only super admins can do this.");
  }

  return { id: user.id, email: account.email, name: account.name, role: account.role };
}
