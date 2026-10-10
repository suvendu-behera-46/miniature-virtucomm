"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export type AdminLoginState = { error?: string };

export async function loginAdmin(_previousState: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter both your email and password." };
  }

  let destination: string | undefined;
  try {
    destination = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      return { error: "Email or password is incorrect." };
    }

    console.error("Admin sign-in could not complete.", error instanceof AuthError ? error.type : "Authentication error");
    return { error: "Unable to verify your account. Check the database connection and try again." };
  }

  if (!destination) {
    return { error: "Email or password is incorrect." };
  }

  redirect(destination);
}
