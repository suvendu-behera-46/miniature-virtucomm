"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { text, toErrorState } from "@/lib/form-data";
import { deleteStoredMedia, getUploadedImages, MediaUploadError, saveImageUpload } from "@/lib/media-storage";
import prisma from "@/lib/prisma";

export async function uploadMedia(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const files = getUploadedImages(formData, "files");
  if (!files.length) return { error: "Choose one or more images to upload." };
  if (files.length > 20) return { error: "Upload up to 20 images at a time." };

  try {
    for (const file of files) {
      const media = await saveImageUpload(file);
      await prisma.mediaAsset.create({
        data: { url: media.url, storageKey: media.storageKey, filename: media.filename, size: media.size, type: "IMAGE", uploadedBy: admin.email },
      });
    }
    revalidatePath("/admin/media");
    return { success: `Uploaded ${files.length} image${files.length === 1 ? "" : "s"}.` };
  } catch (error) {
    if (error instanceof MediaUploadError) return { error: error.message };
    return toErrorState(error, "The upload failed.");
  }
}

export async function deleteMedia(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const asset = await prisma.mediaAsset.delete({ where: { id: text(formData, "id", { max: 40 }) } });
    await deleteStoredMedia(asset.storageKey);
    revalidatePath("/admin/media");
    return { success: "Deleted" };
  } catch (error) {
    return toErrorState(error, "The file could not be deleted.");
  }
}
