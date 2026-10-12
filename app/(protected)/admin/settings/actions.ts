"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { FormError, text, toErrorState } from "@/lib/form-data";
import prisma from "@/lib/prisma";
import { getUploadedImages, MediaUploadError, saveImageUpload } from "@/lib/media-storage";
import { logoSettingKey, siteSettingFields } from "@/lib/site-settings";

export async function saveLogo(_state: ActionState, formData: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  try {
    const [file] = getUploadedImages(formData, "logo");
    if (!file) throw new FormError("Choose a logo image to upload.");
    // Kept in the media library, so a previous logo can still be found there.
    const media = await saveImageUpload(file);
    await prisma.mediaAsset.create({
      data: { url: media.url, storageKey: media.storageKey, filename: media.filename, size: media.size, type: "IMAGE", uploadedBy: me.email },
    });
    await prisma.siteSetting.upsert({
      where: { key: logoSettingKey },
      create: { key: logoSettingKey, value: media.url, description: "Logo" },
      update: { value: media.url },
    });
    revalidatePath("/", "layout");
    return { success: "Logo updated. It may take up to a minute to appear everywhere." };
  } catch (error) {
    if (error instanceof MediaUploadError) return { error: error.message };
    return toErrorState(error, "The logo could not be saved.");
  }
}

export async function resetLogo(): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.siteSetting.deleteMany({ where: { key: logoSettingKey } });
    revalidatePath("/", "layout");
    return { success: "Logo reset to the default." };
  } catch (error) {
    return toErrorState(error, "The logo could not be reset.");
  }
}

export async function saveSiteSettings(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.$transaction(
      siteSettingFields.map((field) => {
        const value = text(formData, field.key, { max: 500, label: field.label });
        if (field.key.endsWith("_url") && value && !/^https:\/\/\S+$/.test(value)) throw new FormError(`${field.label} must start with https://`);
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
