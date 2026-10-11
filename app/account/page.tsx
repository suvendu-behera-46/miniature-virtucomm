import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import { StorefrontFooter, StorefrontHeader } from "@/components/storefront-chrome";

export default async function CustomerAccountPage() {
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
      profileCompletedAt: true,
    },
  });

  if (!customer) redirect("/account/login");
  if (!customer.profileCompletedAt) redirect("/account/complete-profile");

  return (
    <main className="min-h-screen bg-slate-50/60 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800">Your account</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-950">Welcome, {customer.name}</h1>
            <p className="mt-2 text-slate-600">Your saved contact and delivery details.</p>
          </div>
          <Link href="/account/complete-profile" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-cyan-700 hover:text-cyan-800">Edit details</Link>
        </div>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
          <ProfileDetail label="Email" value={customer.email ?? "Not provided"} />
          <ProfileDetail label="Phone" value={customer.phone ?? "Not provided"} />
          <ProfileDetail label="Address" value={[customer.addressLine1, customer.addressLine2].filter(Boolean).join(", ")} />
          <ProfileDetail label="City" value={customer.city ?? ""} />
          <ProfileDetail label="State / region" value={customer.state ?? ""} />
          <ProfileDetail label="Postal code" value={customer.postalCode ?? ""} />
          <ProfileDetail label="Country" value={customer.country ?? "India"} />
        </dl>

        <form action={async () => {
          "use server";
          await signOut({ redirectTo: "/account/login" });
        }} className="mt-8">
          <button type="submit" className="text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-slate-950">Sign out</button>
        </form>
      </section>
      <StorefrontFooter />
    </main>
  );
}

function ProfileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white p-5 sm:p-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</dt>
      <dd className="mt-2 break-words text-sm font-medium text-slate-900">{value || "Not provided"}</dd>
    </div>
  );
}
