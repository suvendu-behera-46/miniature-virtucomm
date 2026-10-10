"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Upload,
  Users,
} from "lucide-react";

const sections = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    title: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, badge: "inquiries" },
      { href: "/admin/reference-uploads", label: "Image submissions", icon: Upload },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/categories", label: "Categories", icon: Boxes },
      { href: "/admin/pricing", label: "Pricing & coupons", icon: CreditCard },
    ],
  },
  {
    title: "Website",
    items: [
      { href: "/admin/content", label: "Website content", icon: FileText },
      { href: "/admin/media", label: "Media library", icon: ImageIcon },
    ],
  },
  {
    title: "Administration",
    items: [
      { href: "/admin/team", label: "Team", icon: ShieldCheck },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
] as const;

export function AdminNav({ newInquiries }: { newInquiries: number }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-5">
      {sections.map((section) => (
        <div key={section.title}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">{section.title}</p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const badge = "badge" in item && newInquiries > 0 ? newInquiries : 0;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-cyan-500/10 text-cyan-300" : "text-slate-300 hover:bg-slate-900 hover:text-white"}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{item.label}</span>
                  {badge > 0 && <span className="rounded-full bg-amber-400 px-1.5 text-xs font-semibold text-slate-950">{badge}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
