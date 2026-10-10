import Link from "next/link";
import { ArrowRight, BadgeIndianRupee, Inbox, Package, ShoppingCart, Upload, Users } from "lucide-react";
import { Badge, Card, statusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, formatDate, humanize, inquirySources } from "@/lib/format";
import prisma from "@/lib/prisma";
import { listReferenceSubmissions } from "@/lib/reference-uploads";

export const dynamic = "force-dynamic";

const closedStatuses = ["COMPLETED", "DELIVERED", "CANCELLED"] as const;

export default async function AdminDashboardPage() {
  await requireAdmin();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5, 1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [orderCount, openOrders, revenue, customerCount, newInquiries, statusCounts, recentOrders, recentInquiries, recentMonthOrders, submissions] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { notIn: [...closedStatuses] } } }),
      prisma.order.aggregate({ _sum: { finalAmount: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.customer.count(),
      prisma.contactInquiry.count({ where: { status: "NEW" } }),
      prisma.order.groupBy({ by: ["status"], _count: true, where: { status: { notIn: [...closedStatuses] } } }),
      prisma.order.findMany({ take: 6, orderBy: { createdAt: "desc" }, include: { customer: true } }),
      prisma.contactInquiry.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
      prisma.order.findMany({ where: { createdAt: { gte: sixMonthsAgo }, status: { not: "CANCELLED" } }, select: { createdAt: true, finalAmount: true } }),
      listReferenceSubmissions().catch(() => []),
    ]);

  const metrics = [
    { label: "Total orders", value: orderCount.toLocaleString("en-IN"), href: "/admin/orders", icon: ShoppingCart },
    { label: "Open orders", value: openOrders.toLocaleString("en-IN"), href: "/admin/orders", icon: Package },
    { label: "Revenue", value: formatCurrency(revenue._sum.finalAmount), href: "/admin/orders", icon: BadgeIndianRupee },
    { label: "Customers", value: customerCount.toLocaleString("en-IN"), href: "/admin/customers", icon: Users },
    { label: "New inquiries", value: newInquiries.toLocaleString("en-IN"), href: "/admin/inquiries?status=NEW", icon: Inbox, highlight: newInquiries > 0 },
    { label: "Image submissions", value: submissions.length.toLocaleString("en-IN"), href: "/admin/reference-uploads", icon: Upload },
  ];

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(sixMonthsAgo);
    date.setMonth(sixMonthsAgo.getMonth() + index);
    const inMonth = recentMonthOrders.filter((order) => order.createdAt.getFullYear() === date.getFullYear() && order.createdAt.getMonth() === date.getMonth());
    return {
      label: date.toLocaleString("en-IN", { month: "short" }),
      count: inMonth.length,
      revenue: inMonth.reduce((total, order) => total + Number(order.finalAmount), 0),
    };
  });
  const maxCount = Math.max(1, ...months.map((month) => month.count));
  const statusTotal = statusCounts.reduce((total, row) => total + row._count, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Overview</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders/new" className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">New order</Link>
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-cyan-500">Add product</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metrics.map(({ label, value, href, icon: Icon, highlight }) => (
          <Link key={label} href={href} className={`rounded-2xl border p-5 transition hover:border-cyan-500/60 ${highlight ? "border-amber-400/50 bg-amber-400/5" : "border-slate-800 bg-slate-900/80"}`}>
            <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300"><Icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-sm text-slate-400">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Orders, last 6 months">
          <div className="flex h-56 items-end gap-4">
            {months.map((month) => (
              <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs text-slate-400">{month.count}</span>
                <div className="flex w-full flex-1 items-end rounded-xl bg-slate-950">
                  <div className="w-full rounded-xl bg-gradient-to-t from-cyan-500 to-sky-400" style={{ height: `${Math.max(month.count ? 6 : 0, (month.count / maxCount) * 100)}%` }} title={formatCurrency(month.revenue)} />
                </div>
                <span className="text-xs text-slate-400">{month.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Open orders by status">
          {statusTotal === 0 ? (
            <p className="text-sm text-slate-400">No open orders.</p>
          ) : (
            <div className="space-y-3">
              {statusCounts.sort((a, b) => b._count - a._count).map((row) => (
                <Link key={row.status} href={`/admin/orders?status=${row.status}`} className="block">
                  <div className="mb-1 flex justify-between text-sm text-slate-300"><span>{humanize(row.status)}</span><span>{row._count}</span></div>
                  <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-500" style={{ width: `${(row._count / statusTotal) * 100}%` }} /></div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Recent orders" actions={<Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>}>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400">No orders yet. <Link href="/admin/orders/new" className="text-cyan-300">Record one</Link>.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {recentOrders.map((order) => (
                <li key={order.id}>
                  <Link href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-cyan-300">
                    <span className="text-sm">
                      <span className="font-medium text-white">{order.orderNumber}</span>
                      <span className="block text-xs text-slate-500">{order.customer?.name ?? "No customer"} · {formatDate(order.createdAt)}</span>
                    </span>
                    <span className="text-right text-sm">
                      <span className="block">{formatCurrency(order.finalAmount)}</span>
                      <Badge tone={statusTone(order.status)}>{humanize(order.status)}</Badge>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Latest inquiries" actions={<Link href="/admin/inquiries" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:text-cyan-200">View all <ArrowRight className="h-4 w-4" /></Link>}>
          {recentInquiries.length === 0 ? (
            <p className="text-sm text-slate-400">No inquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {recentInquiries.map((inquiry) => (
                <li key={inquiry.id}>
                  <Link href={`/admin/inquiries/${inquiry.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-cyan-300">
                    <span className="min-w-0 text-sm">
                      <span className="font-medium text-white">{inquiry.name}</span>
                      <span className="block truncate text-xs text-slate-500">{inquirySources[inquiry.source] ?? inquiry.source} · {inquiry.message}</span>
                    </span>
                    <Badge tone={statusTone(inquiry.status)}>{humanize(inquiry.status)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
