"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/components/admin/action-form";
import { requireAdmin } from "@/lib/admin-auth";
import { FormError, optionalEmail, optionalText, text, toErrorState } from "@/lib/form-data";
import { inquiryStatuses, type InquiryStatusValue } from "@/lib/format";
import { recordInquiry } from "@/lib/inquiries";
import prisma from "@/lib/prisma";

export async function updateInquiry(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id", { max: 40 });
    const status = text(formData, "status", { max: 20 });
    if (!inquiryStatuses.includes(status as InquiryStatusValue)) throw new FormError("Choose a valid status.");
    await prisma.contactInquiry.update({
      where: { id },
      data: { status, notes: optionalText(formData, "notes", { max: 5000, label: "Notes" }) },
    });
    revalidatePath(`/admin/inquiries/${id}`);
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
    return { success: "Inquiry updated." };
  } catch (error) {
    return toErrorState(error, "The inquiry could not be updated.");
  }
}

export async function createInquiry(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  let id: string;
  try {
    const email = optionalEmail(formData, "email");
    const phone = optionalText(formData, "phone", { max: 30, label: "Phone" });
    if (!email && !phone) throw new FormError("Enter an email or phone number.");
    id = (
      await recordInquiry({
        name: text(formData, "name", { required: true, max: 120, label: "Name" }),
        email,
        phone,
        subject: optionalText(formData, "subject", { max: 200, label: "Subject" }),
        message: text(formData, "message", { required: true, max: 5000, label: "Message" }),
        source: "MANUAL",
      })
    ).id;
    revalidatePath("/admin/inquiries");
  } catch (error) {
    return toErrorState(error, "The inquiry could not be saved.");
  }
  redirect(`/admin/inquiries/${id}`);
}

export async function deleteInquiry(_state: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  try {
    await prisma.contactInquiry.delete({ where: { id: text(formData, "id", { max: 40 }) } });
    revalidatePath("/admin/inquiries");
    revalidatePath("/admin");
  } catch (error) {
    return toErrorState(error, "The inquiry could not be deleted.");
  }
  redirect("/admin/inquiries");
}
