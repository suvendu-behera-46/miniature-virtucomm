"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { bool, FormError, integer, optionalText, text, toErrorState } from "@/lib/form-data";
import { getMainGalleryId } from "@/lib/gallery";
import { getUploadedImages, MediaUploadError, saveImageUpload } from "@/lib/media-storage";
import prisma from "@/lib/prisma";

function refresh() {
  revalidatePath("/admin/content");
  revalidatePath("/");
  revalidatePath("/gallery");
}

async function readImage(formData: FormData, { required = false } = {}) {
  const [file] = getUploadedImages(formData, "image");
  if (file) {
    const media = await saveImageUpload(file);
    await prisma.mediaAsset.create({ data: { url: media.url, storageKey: media.storageKey, filename: media.filename, size: media.size, type: "IMAGE" } });
    return media.url;
  }
  const url = text(formData, "imageUrl", { max: 1000 });
  if (url && !/^(https:\/\/|\/media\/)/.test(url)) throw new FormError("Image URLs must start with https:// or /media/.");
  if (required && !url) throw new FormError("Upload an image or paste an image URL.");
  return url || null;
}

function wrap(fallback: string, run: () => Promise<string>) {
  return run()
    .then((success): ActionState => {
      refresh();
      return { success };
    })
    .catch((error): ActionState => (error instanceof MediaUploadError ? { error: error.message } : toErrorState(error, fallback)));
}

export async function saveTestimonial(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  return wrap("The testimonial could not be saved.", async () => {
    const id = text(formData, "id", { max: 40 });
    const rating = Math.min(5, Math.max(1, integer(formData, "rating", 5)));
    const photo = await readImage(formData);
    const data = {
      name: text(formData, "name", { required: true, max: 120, label: "Name" }),
      testimonial: text(formData, "testimonial", { required: true, max: 2000, label: "Testimonial" }),
      product: optionalText(formData, "product", { max: 120, label: "Product" }),
      rating,
      featured: bool(formData, "featured"),
      active: id ? bool(formData, "active") : true,
      ...(photo ? { profilePhoto: photo } : {}),
    };
    if (id) await prisma.testimonial.update({ where: { id }, data });
    else await prisma.testimonial.create({ data });
    return "Testimonial saved.";
  });
}

export async function saveFaq(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  return wrap("The FAQ could not be saved.", async () => {
    const id = text(formData, "id", { max: 40 });
    const data = {
      question: text(formData, "question", { required: true, max: 300, label: "Question" }),
      answer: text(formData, "answer", { required: true, max: 3000, label: "Answer" }),
      displayOrder: integer(formData, "displayOrder"),
      active: id ? bool(formData, "active") : true,
    };
    if (id) await prisma.fAQ.update({ where: { id }, data });
    else await prisma.fAQ.create({ data });
    return "FAQ saved.";
  });
}

export async function saveGalleryImage(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  return wrap("The gallery image could not be saved.", async () => {
    const id = text(formData, "id", { max: 40 });
    const imageUrl = await readImage(formData, { required: !id });
    const data = {
      title: optionalText(formData, "title", { max: 120, label: "Title" }),
      caption: optionalText(formData, "caption", { max: 300, label: "Caption" }),
      featured: bool(formData, "featured"),
      sortOrder: integer(formData, "sortOrder"),
      active: id ? bool(formData, "active") : true,
      ...(imageUrl ? { imageUrl } : {}),
    };
    if (id) await prisma.galleryImage.update({ where: { id }, data });
    else await prisma.galleryImage.create({ data: { ...data, imageUrl: imageUrl!, galleryId: await getMainGalleryId() } });
    return "Gallery image saved.";
  });
}

export async function deleteContent(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  return wrap("The item could not be deleted.", async () => {
    const id = text(formData, "id", { max: 40 });
    const kind = text(formData, "kind", { max: 20 });
    if (kind === "testimonial") await prisma.testimonial.delete({ where: { id } });
    else if (kind === "faq") await prisma.fAQ.delete({ where: { id } });
    else if (kind === "gallery") await prisma.galleryImage.delete({ where: { id } });
    else throw new FormError("Unknown item.");
    return "Deleted.";
  });
}
