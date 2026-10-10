"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { FormError, text, toErrorState } from "@/lib/form-data";
import prisma from "@/lib/prisma";
import { siteSettingFields } from "@/lib/site-settings";

export async function saveSiteSettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      siteSettingFields.map((field) => {
        const value = text(formData, field.key, { max: 500, label: field.label });
        return prisma.siteSetting.upsert({
          where: { key: field.key },
          create: { key: field.key, value, description: field.label },
          update: { value },
        });
      }),
    );
    revalidatePath("/", "layout");
    return { success: "Settings saved." };
  } catch (error) {
    return toErrorState(error, "Settings could not be saved.");
  }
}

export async function changeOwnPassword(_state: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  try {
    const current = text(formData, "currentPassword", { required: true, max: 200, label: "Current password" });
    const next = text(formData, "newPassword", { max: 200 });
    if (next.length < 8) throw new FormError("The new password must be at least 8 characters.");
    if (next !== text(formData, "confirmPassword", { max: 200 })) throw new FormError("The new passwords don't match.");

    const user = await prisma.adminUser.findUnique({ where: { id: me.id } });
    if (!user || !(await compare(current, user.password))) throw new FormError("Your current password is incorrect.");
    await prisma.adminUser.update({ where: { id: me.id }, data: { password: await hash(next, 10) } });
    return { success: "Password changed." };
  } catch (error) {
    return toErrorState(error, "Your password could not be changed.");
  }
}
