"use server";

import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { RoleType } from "@prisma/client";
import type { ActionState } from "@/components/admin/action-form";
import { adminRoles, requireAdmin, type AdminRole } from "@/lib/admin-auth";
import { bool, FormError, optionalEmail, text, toErrorState } from "@/lib/form-data";
import prisma from "@/lib/prisma";

function readRole(formData: FormData): RoleType {
  const role = text(formData, "role", { max: 20 });
  if (!adminRoles.includes(role as AdminRole)) throw new FormError("Choose a valid role.");
  return role as RoleType;
}

function readPassword(formData: FormData, name = "password") {
  const password = text(formData, name, { max: 200 });
  if (password.length < 8) throw new FormError("Passwords must be at least 8 characters.");
  return password;
}

export async function createAdminUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin({ superAdmin: true });
  try {
    const email = optionalEmail(formData, "email");
    if (!email) throw new FormError("Enter an email address.");
    await prisma.adminUser.create({
      data: {
        name: text(formData, "name", { required: true, max: 120, label: "Name" }),
        email,
        password: await hash(readPassword(formData), 10),
        role: readRole(formData),
      },
    });
    revalidatePath("/admin/team");
    return { success: `Added ${email}. They can sign in at /admin/login.` };
  } catch (error) {
    return toErrorState(error, "The team member could not be added.");
  }
}

export async function updateAdminUser(_state: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireAdmin({ superAdmin: true });
  try {
    const id = text(formData, "id", { max: 40 });
    const role = readRole(formData);
    const active = bool(formData, "active");
    if (id === me.id && (role !== "SUPER_ADMIN" || !active)) throw new FormError("You can't remove your own super admin access.");
    const newPassword = text(formData, "newPassword", { max: 200 });

    await prisma.adminUser.update({
      where: { id },
      data: {
        name: text(formData, "name", { required: true, max: 120, label: "Name" }),
        role,
        active,
        ...(newPassword ? { password: await hash(readPassword(formData, "newPassword"), 10) } : {}),
      },
    });
    revalidatePath("/admin/team");
    return { success: newPassword ? "Saved, and password reset." : "Saved." };
  } catch (error) {
    return toErrorState(error, "The team member could not be updated.");
  }
}
