"use server";

import { revalidatePath } from "next/cache";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { bool, FormError, integer, money, text, toErrorState } from "@/lib/form-data";
import prisma from "@/lib/prisma";

export async function updateProductPrice(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const product = await prisma.product.update({
      where: { id: text(formData, "id", { max: 40 }) },
      data: {
        basePrice: money(formData, "basePrice", { required: true, label: "Price" })!,
        comparePrice: money(formData, "comparePrice", { label: "Compare-at price" }),
      },
    });
    revalidatePath("/admin/pricing");
    revalidatePath("/products");
    revalidatePath("/");
    revalidatePath(`/product/${product.slug}`);
    return { success: "Saved" };
  } catch (error) {
    return toErrorState(error, "The price could not be saved.");
  }
}

function optionalDate(formData: FormData, name: string) {
  const value = text(formData, name, { max: 20 });
  if (!value) return null;
  const date = new Date(`${value}T00:00:00+05:30`);
  if (Number.isNaN(date.getTime())) throw new FormError("Enter valid dates.");
  return date;
}

export async function createCoupon(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const code = text(formData, "code", { required: true, max: 30, label: "Code" }).toUpperCase().replace(/\s+/g, "");
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) throw new FormError("Codes use 3–30 letters, numbers, - or _.");
    const discountType = text(formData, "discountType", { max: 20 }) === "FIXED" ? "FIXED" : "PERCENTAGE";
    const value = money(formData, "value", { required: true, label: "Discount value" })!;
    if (discountType === "PERCENTAGE" && (Number(value) <= 0 || Number(value) > 100)) throw new FormError("Percentage must be between 1 and 100.");
    const startDate = optionalDate(formData, "startDate");
    const endDate = optionalDate(formData, "endDate");
    if (startDate && endDate && endDate < startDate) throw new FormError("The end date must be after the start date.");

    await prisma.coupon.create({
      data: {
        code,
        discountType,
        percentage: discountType === "PERCENTAGE" ? value : null,
        fixedAmount: discountType === "FIXED" ? value : null,
        minimumOrder: money(formData, "minimumOrder", { label: "Minimum order" }),
        maximumDiscount: money(formData, "maximumDiscount", { label: "Maximum discount" }),
        startDate,
        endDate,
        usageLimit: integer(formData, "usageLimit", 0) || null,
        active: true,
      },
    });
    revalidatePath("/admin/pricing");
    return { success: `Coupon ${code} created.` };
  } catch (error) {
    return toErrorState(error, "The coupon could not be created.");
  }
}

export async function toggleCoupon(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const coupon = await prisma.coupon.findUniqueOrThrow({ where: { id: text(formData, "id", { max: 40 }) } });
    await prisma.coupon.update({ where: { id: coupon.id }, data: { active: bool(formData, "active") } });
    revalidatePath("/admin/pricing");
    return { success: "Updated" };
  } catch (error) {
    return toErrorState(error, "The coupon could not be updated.");
  }
}

export async function deleteCoupon(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.coupon.delete({ where: { id: text(formData, "id", { max: 40 }) } });
    revalidatePath("/admin/pricing");
    return { success: "Deleted" };
  } catch (error) {
    return toErrorState(error, "The coupon could not be deleted.");
  }
}
