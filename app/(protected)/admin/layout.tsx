import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin-auth";
import { logoPath } from "@/lib/site-settings";
import { humanize } from "@/lib/format";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const userRole = (session.user as typeof session.user & { role?: string }).role;
  if (userRole === "CUSTOMER") {
    redirect("/account");
  }

  const admin = await requireAdmin();
  const newInquiries = await prisma.contactInquiry.count({ where: { status: "NEW" } });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 h-screen w-72 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/90 p-5">
          <div className="mb-6 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- the logo is swapped at runtime from Settings */}
              <img src={logoPath} alt="" width={44} height={44} className="h-11 w-11 rounded-full bg-white object-cover" />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Mukti Miniature</p>
                <h1 className="mt-1 text-xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>
            <Link href="/" target="_blank" title="Open storefront" className="text-slate-400 hover:text-cyan-300"><ExternalLink className="h-5 w-5" /></Link>
          </div>

          <AdminNav newInquiries={newInquiries} />

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in</p>
            <p className="mt-2 font-medium text-white">{admin.name}</p>
            <p className="text-sm text-slate-400">{admin.email}</p>
            <p className="mt-1 text-xs text-cyan-400">{humanize(admin.role)}</p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
            className="mt-4"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-rose-500 hover:text-rose-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 bg-slate-950 p-6 xl:p-8">
          <div data-gsap-section className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
