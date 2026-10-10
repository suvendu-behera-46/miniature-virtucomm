"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { bool, FormError, money, optionalText, text, toErrorState } from "@/lib/form-data";
import { slugify } from "@/lib/format";
import { deleteStoredMedia, getUploadedImages, MediaUploadError, saveImageUpload } from "@/lib/media-storage";
import prisma from "@/lib/prisma";

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath("/");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function saveProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id", { max: 40 });
  let savedId: string;

  try {
    const name = text(formData, "name", { required: true, max: 160, label: "Product name" });
    const slug = slugify(text(formData, "slug", { max: 80 }) || name);
    if (!slug) throw new FormError("Enter a URL slug using letters or numbers.");
    const basePrice = money(formData, "basePrice", { required: true, label: "Price" })!;
    const categoryId = text(formData, "categoryId", { max: 40 }) || null;

    const data = {
      name,
      slug,
      basePrice,
      comparePrice: money(formData, "comparePrice", { label: "Compare-at price" }),
      categoryId,
      shortDescription: optionalText(formData, "shortDescription", { max: 300, label: "Headline" }),
      fullDescription: optionalText(formData, "fullDescription", { max: 5000, label: "Description" }),
      features: optionalText(formData, "features", { max: 3000, label: "Features" }),
      sku: optionalText(formData, "sku", { max: 60, label: "SKU" }),
      material: optionalText(formData, "material", { max: 120, label: "Material" }),
      productionTime: optionalText(formData, "productionTime", { max: 120, label: "Production time" }),
      seoTitle: optionalText(formData, "seoTitle", { max: 160, label: "SEO title" }),
      seoDescription: optionalText(formData, "seoDescription", { max: 320, label: "SEO description" }),
      featured: bool(formData, "featured"),
      popular: bool(formData, "popular"),
      newProduct: bool(formData, "newProduct"),
      active: bool(formData, "active"),
    };

    const product = id
      ? await prisma.product.update({ where: { id }, data })
      : await prisma.product.create({ data });
    savedId = product.id;

    await addImages(product.id, formData);
    revalidateStorefront(product.slug);
  } catch (error) {
    if (error instanceof MediaUploadError) return { error: error.message };
    return toErrorState(error, "The product could not be saved.");
  }

  if (!id) redirect(`/admin/products/${savedId}?created=1`);
  return { success: "Product saved." };
}

async function addImages(productId: string, formData: FormData) {
  const files = getUploadedImages(formData);
  const imageUrl = text(formData, "imageUrl", { max: 1000 });
  if (!files.length && !imageUrl) return;
  if (imageUrl && !/^(https:\/\/|\/media\/)/.test(imageUrl)) throw new FormError("Image URLs must start with https://.");

  const existing = await prisma.productImage.count({ where: { productId } });
  const stored = [];
  for (const file of files) stored.push(await saveImageUpload(file));

  const images = [
    ...stored.map((media) => ({ url: media.url, storageKey: media.storageKey, filename: media.filename, size: media.size })),
    ...(imageUrl ? [{ url: imageUrl, storageKey: null, filename: null, size: null }] : []),
  ];
  await prisma.productImage.createMany({
    data: images.map((image, index) => ({
      ...image,
      productId,
      sortOrder: existing + index,
      isPrimary: existing === 0 && index === 0,
    })),
  });
}

export async function deleteProduct(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id", { max: 40 });
  try {
    const product = await prisma.product.delete({ where: { id }, include: { images: true } });
    await Promise.all(product.images.map((image) => deleteStoredMedia(image.storageKey)));
    revalidateStorefront(product.slug);
  } catch (error) {
    return toErrorState(error, "The product could not be deleted.");
  }
  redirect("/admin/products");
}

export async function deleteProductImage(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const image = await prisma.productImage.delete({ where: { id: text(formData, "imageId", { max: 40 }) }, include: { product: true } });
    await deleteStoredMedia(image.storageKey);
    if (image.isPrimary) {
      const next = await prisma.productImage.findFirst({ where: { productId: image.productId }, orderBy: { sortOrder: "asc" } });
      if (next) await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
    revalidateStorefront(image.product.slug);
    revalidatePath(`/admin/products/${image.productId}`);
    return { success: "Image removed." };
  } catch (error) {
    return toErrorState(error, "The image could not be removed.");
  }
}

export async function setPrimaryProductImage(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const image = await prisma.productImage.findUniqueOrThrow({ where: { id: text(formData, "imageId", { max: 40 }) }, include: { product: true } });
    await prisma.$transaction([
      prisma.productImage.updateMany({ where: { productId: image.productId }, data: { isPrimary: false } }),
      prisma.productImage.update({ where: { id: image.id }, data: { isPrimary: true } }),
    ]);
    revalidateStorefront(image.product.slug);
    revalidatePath(`/admin/products/${image.productId}`);
    return { success: "Main image updated." };
  } catch (error) {
    return toErrorState(error, "The main image could not be changed.");
  }
}

export async function toggleProductActive(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: text(formData, "id", { max: 40 }) } });
    await prisma.product.update({ where: { id: product.id }, data: { active: !product.active } });
    revalidateStorefront(product.slug);
    return { success: product.active ? "Hidden from store." : "Published." };
  } catch (error) {
    return toErrorState(error, "The product could not be updated.");
  }
}
