import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { StorefrontHeader, StorefrontFooter } from "@/components/storefront-chrome";
import { GoogleLoginButton } from "./google-login-button";

export default async function CustomerLoginPage() {
  const session = await auth();
  const sessionUser = session?.user as (NonNullable<typeof session>["user"] & { id?: string; role?: string }) | undefined;
  if (sessionUser?.role === "CUSTOMER" && sessionUser.id) {
    // Only skip the sign-in page if the customer record still exists, to avoid a redirect loop.
    const customer = await prisma.customer.findUnique({ where: { id: sessionUser.id }, select: { id: true } });
    if (customer) redirect("/account");
  }

  const googleReady = Boolean(
    (process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID) &&
      (process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET),
  );

  return (
    <main className="flex min-h-screen flex-col bg-slate-50/60 text-slate-900 backdrop-blur-[1px]">
      <StorefrontHeader />
      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-5 py-16">
        <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 md:grid-cols-[1fr_0.9fr]">
          <div className="hidden min-h-[440px] flex-col justify-between bg-slate-950 p-10 text-white md:flex">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Stature 3D · Your account</p>
            <div>
              <h1 className="text-3xl font-bold leading-tight">Keep every detail of your keepsake in one place.</h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">Sign in to save your delivery details and make your next custom order easier.</p>
            </div>
            <p className="text-sm text-slate-400">Private, secure, and connected to your Google account.</p>
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-10">
            <Link href="/" className="text-sm font-medium text-cyan-800 hover:text-cyan-600">← Back to store</Link>
            <h2 className="mt-8 text-2xl font-bold text-slate-950">Customer sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Continue with Google. We’ll ask for your phone number and delivery details before saving your profile.</p>
            <div className="mt-8">
              <GoogleLoginButton ready={googleReady} />
            </div>
            <p className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500">
              Studio administrator? <Link href="/admin/login" className="font-medium text-cyan-800 hover:text-cyan-600">Admin login</Link>
            </p>
          </div>
        </div>
      </section>
      <StorefrontFooter />
    </main>
  );
}
