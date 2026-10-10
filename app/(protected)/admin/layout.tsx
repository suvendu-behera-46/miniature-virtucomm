import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/reference-uploads", label: "Image submissions", icon: Upload },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Boxes },
  { href: "/admin/pricing", label: "Pricing", icon: CreditCard },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const userRole = (session.user as typeof session.user & { role?: string }).role;
  if (userRole === "CUSTOMER") {
    redirect("/account");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-800 bg-slate-950/90 p-5">
          <div className="mb-8 flex items-center justify-between px-2">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-400">Miniature</p>
              <h1 className="mt-2 text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <Bell className="h-5 w-5 text-slate-400" />
          </div>

          <nav className="space-y-2">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Signed in</p>
            <p className="mt-2 font-medium text-white">{session.user.name || "Admin"}</p>
            <p className="text-sm text-slate-400">{session.user.email}</p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
            className="mt-8"
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

        <main className="flex-1 bg-slate-950 p-6 xl:p-8">
          <div data-gsap-section className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
