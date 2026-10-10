"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export type CustomerProfileState = { error?: string };

export async function saveCustomerProfile(
  _previousState: CustomerProfileState,
  formData: FormData,
): Promise<CustomerProfileState> {
  const session = await auth();
  const sessionUser = session?.user as (NonNullable<typeof session>["user"] & { id?: string; role?: string }) | undefined;

  if (!sessionUser?.id || sessionUser.role !== "CUSTOMER") {
    redirect("/account/login");
  }

  const profile = {
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    addressLine1: String(formData.get("addressLine1") ?? "").trim(),
    addressLine2: String(formData.get("addressLine2") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    state: String(formData.get("state") ?? "").trim(),
    postalCode: String(formData.get("postalCode") ?? "").trim(),
    country: String(formData.get("country") ?? "India").trim(),
  };

  const phoneDigits = profile.phone.replace(/\D/g, "");
  if (!profile.name || phoneDigits.length < 7 || phoneDigits.length > 15 || !profile.addressLine1 || !profile.city || !profile.state || profile.postalCode.length < 3 || !profile.country) {
    return { error: "Complete all required fields and enter a valid phone number." };
  }

  try {
    await prisma.customer.update({
      where: { id: sessionUser.id },
      data: {
        ...profile,
        addressLine2: profile.addressLine2 || null,
        profileCompletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Customer profile could not be saved.", error instanceof Error ? error.name : "Database error");
    return { error: "Your details could not be saved. Check the database connection and try again." };
  }

  redirect("/account");
}
