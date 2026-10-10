"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { optionalEmail, optionalText, text, toErrorState } from "@/lib/form-data";
import prisma from "@/lib/prisma";

function readCustomer(formData: FormData) {
  return {
    name: text(formData, "name", { required: true, max: 120, label: "Name" }),
    email: optionalEmail(formData, "email"),
    phone: optionalText(formData, "phone", { max: 30, label: "Phone" }),
    addressLine1: optionalText(formData, "addressLine1", { max: 200, label: "Address" }),
    addressLine2: optionalText(formData, "addressLine2", { max: 200, label: "Address line 2" }),
    city: optionalText(formData, "city", { max: 80, label: "City" }),
    state: optionalText(formData, "state", { max: 80, label: "State" }),
    postalCode: optionalText(formData, "postalCode", { max: 20, label: "Postal code" }),
    country: optionalText(formData, "country", { max: 80, label: "Country" }),
    notes: optionalText(formData, "notes", { max: 3000, label: "Notes" }),
  };
}

export async function saveCustomer(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = text(formData, "id", { max: 40 });
  let createdId: string | undefined;
  try {
    const data = readCustomer(formData);
    if (id) {
      await prisma.customer.update({ where: { id }, data });
      revalidatePath(`/admin/customers/${id}`);
    } else {
      createdId = (await prisma.customer.create({ data })).id;
    }
    revalidatePath("/admin/customers");
  } catch (error) {
    return toErrorState(error, "The customer could not be saved.");
  }
  if (createdId) redirect(`/admin/customers/${createdId}`);
  return { success: "Customer saved." };
}

export async function deleteCustomer(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.customer.delete({ where: { id: text(formData, "id", { max: 40 }) } });
    revalidatePath("/admin/customers");
  } catch (error) {
    return toErrorState(error, "The customer could not be deleted.");
  }
  redirect("/admin/customers");
}
