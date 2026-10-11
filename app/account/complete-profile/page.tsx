import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";
import { CustomerProfileForm } from "../customer-profile-form";

export default async function CompleteCustomerProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/account/login");

  const user = session.user as typeof session.user & { id?: string; role?: string };
  // Admin sessions share the same cookie; send them to the customer sign-in instead of the admin panel.
  if (user.role !== "CUSTOMER") redirect("/account/login");

  const customer = await prisma.customer.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      state: true,
      postalCode: true,
      country: true,
    },
  });

  if (!customer) redirect("/account/login");

  return (
    <main className="min-h-screen bg-slate-50/60 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">Your account</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950">Delivery details</h1>
          <p className="mt-3 text-slate-600">Add your phone number and delivery address. We’ll save these details to your customer profile for future orders.</p>
          {customer.email && <p className="mt-3 text-sm text-slate-500">Google account: {customer.email}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <CustomerProfileForm
            profile={{
              name: customer.name,
              phone: customer.phone ?? "",
              addressLine1: customer.addressLine1 ?? "",
              addressLine2: customer.addressLine2 ?? "",
              city: customer.city ?? "",
              state: customer.state ?? "",
              postalCode: customer.postalCode ?? "",
              country: customer.country ?? "India",
            }}
          />
        </div>
      </section>
      <StorefrontFooter />
    </main>
  );
}
