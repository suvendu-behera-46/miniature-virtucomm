"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { bool, FormError, integer, optionalText, text, toErrorState } from "@/lib/form-data";
import { slugify } from "@/lib/format";
import prisma from "@/lib/prisma";

export async function saveCategory(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id", { max: 40 });
  try {
    const name = text(formData, "name", { required: true, max: 80, label: "Category name" });
    const slug = slugify(text(formData, "slug", { max: 80 }) || name);
    if (!slug) throw new FormError("Enter a URL slug using letters or numbers.");
    const data = {
      name,
      slug,
      description: optionalText(formData, "description", { max: 500, label: "Description" }),
      displayOrder: integer(formData, "displayOrder"),
      active: id ? bool(formData, "active") : true,
    };
    if (id) await prisma.category.update({ where: { id }, data });
    else await prisma.category.create({ data });
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { success: id ? "Category saved." : `Created “${name}”.` };
  } catch (error) {
    return toErrorState(error, "The category could not be saved.");
  }
}

export async function deleteCategory(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.category.delete({ where: { id: text(formData, "id", { max: 40 }) } });
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    return { success: "Category deleted." };
  } catch (error) {
    return toErrorState(error, "The category could not be deleted.");
  }
}
