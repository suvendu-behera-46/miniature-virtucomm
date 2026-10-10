"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { FormError, integer, money, optionalEmail, optionalText, text, toErrorState } from "@/lib/form-data";
import { orderStatuses } from "@/lib/format";
import prisma from "@/lib/prisma";

function readStatus(formData: FormData): OrderStatus {
  const status = text(formData, "status", { max: 40 }) || "NEW";
  if (!orderStatuses.includes(status as OrderStatus)) throw new FormError("Choose a valid status.");
  return status as OrderStatus;
}

async function nextOrderNumber() {
  const prefix = `MIN-${new Date().getFullYear()}-`;
  const last = await prisma.order.findFirst({ where: { orderNumber: { startsWith: prefix } }, orderBy: { orderNumber: "desc" } });
  const sequence = last ? Number.parseInt(last.orderNumber.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(sequence).padStart(6, "0")}`;
}

export async function createOrder(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  let orderId: string;

  try {
    let customerId = text(formData, "customerId", { max: 40 }) || null;
    if (!customerId) {
      const name = text(formData, "customerName", { max: 120, label: "Customer name" });
      if (!name) throw new FormError("Choose an existing customer or enter a new customer's name.");
      const email = optionalEmail(formData, "customerEmail");
      const phone = optionalText(formData, "customerPhone", { max: 30, label: "Phone" });
      const existing = email ? await prisma.customer.findUnique({ where: { email } }) : null;
      customerId = existing?.id ?? (await prisma.customer.create({ data: { name, email, phone } })).id;
    }

    const productId = text(formData, "productId", { max: 40 }) || null;
    const product = productId ? await prisma.product.findUnique({ where: { id: productId } }) : null;
    const productName = text(formData, "productName", { max: 200 }) || product?.name || null;
    if (!productName) throw new FormError("Choose a product or describe what is being made.");

    const quantity = Math.max(1, Math.min(100, integer(formData, "quantity", 1)));
    const unitPrice = Number(money(formData, "unitPrice", { label: "Unit price" }) ?? product?.basePrice ?? 0);
    const discount = Number(money(formData, "discount", { label: "Discount" }) ?? 0);
    const subtotal = unitPrice * quantity;
    const finalAmount = Math.max(0, subtotal - discount);
    const status = readStatus(formData);
    const inquiryId = text(formData, "inquiryId", { max: 40 }) || null;

    let order;
    for (let attempt = 0; ; attempt++) {
      try {
        order = await prisma.order.create({
          data: {
            orderNumber: await nextOrderNumber(),
            customerId,
            productName,
            amount: subtotal.toFixed(2),
            originalAmount: subtotal.toFixed(2),
            discount: discount.toFixed(2),
            finalAmount: finalAmount.toFixed(2),
            status,
            priority: text(formData, "priority", { max: 20 }) || "normal",
            shippingAddress: optionalText(formData, "shippingAddress", { max: 500, label: "Shipping address" }),
            specialInstructions: optionalText(formData, "specialInstructions", { max: 3000, label: "Instructions" }),
            items: { create: { productId: product?.id, quantity, unitPrice: unitPrice.toFixed(2), totalPrice: subtotal.toFixed(2) } },
            statusHistory: { create: { newStatus: status, changedById: admin.id, note: inquiryId ? "Created from inquiry" : "Order created" } },
          },
        });
        break;
      } catch (error) {
        // Another order took the same number; retry with the next one.
        if (attempt < 3 && error && typeof error === "object" && "code" in error && error.code === "P2002") continue;
        throw error;
      }
    }
    orderId = order.id;

    if (inquiryId) {
      await prisma.contactInquiry.update({ where: { id: inquiryId }, data: { status: "CONVERTED", customerId } }).catch(() => undefined);
      revalidatePath("/admin/inquiries");
    }
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
  } catch (error) {
    return toErrorState(error, "The order could not be created.");
  }
  redirect(`/admin/orders/${orderId}`);
}

export async function updateOrderStatus(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    const id = text(formData, "id", { max: 40 });
    const status = readStatus(formData);
    const note = optionalText(formData, "note", { max: 1000, label: "Note" });
    const order = await prisma.order.findUniqueOrThrow({ where: { id } });
    if (order.status === status && !note) return { error: "Choose a different status or add a note." };

    await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: { create: { oldStatus: order.status, newStatus: status, changedById: admin.id, note } },
      },
    });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: "Status updated." };
  } catch (error) {
    return toErrorState(error, "The status could not be updated.");
  }
}

export async function updateOrderDetails(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id", { max: 40 });
    const amount = Number(money(formData, "amount", { required: true, label: "Subtotal" }));
    const discount = Number(money(formData, "discount", { label: "Discount" }) ?? 0);
    await prisma.order.update({
      where: { id },
      data: {
        productName: optionalText(formData, "productName", { max: 200, label: "Product" }),
        amount: amount.toFixed(2),
        discount: discount.toFixed(2),
        finalAmount: Math.max(0, amount - discount).toFixed(2),
        priority: text(formData, "priority", { max: 20 }) || "normal",
        shippingAddress: optionalText(formData, "shippingAddress", { max: 500, label: "Shipping address" }),
        specialInstructions: optionalText(formData, "specialInstructions", { max: 3000, label: "Instructions" }),
      },
    });
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { success: "Order details saved." };
  } catch (error) {
    return toErrorState(error, "The order could not be saved.");
  }
}

export async function addOrderNote(_state: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  try {
    const orderId = text(formData, "id", { max: 40 });
    const message = text(formData, "message", { required: true, max: 3000, label: "Note" });
    await prisma.orderNote.create({ data: { orderId, message, adminId: admin.id } });
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: "Note added." };
  } catch (error) {
    return toErrorState(error, "The note could not be added.");
  }
}

export async function deleteOrder(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.order.delete({ where: { id: text(formData, "id", { max: 40 }) } });
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
  } catch (error) {
    return toErrorState(error, "The order could not be deleted.");
  }
  redirect("/admin/orders");
}
