import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { Badge, buttonClass, EmptyState, inputClass, PageHeader, SearchBar, secondaryButtonClass, statusTone, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, formatDate, humanize, orderStatuses } from "@/lib/format";
import { buildOrderFilter } from "@/lib/order-filter";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireAdmin();
  const { q = "", status = "" } = await searchParams;

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({ where: buildOrderFilter(q, status), include: { customer: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (value: string) => counts.find((row) => row.status === value)?._count ?? 0;
  const total = counts.reduce((sum, row) => sum + row._count, 0);
  const exportQuery = new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) }).toString();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        actions={
          <>
            <a href={`/api/admin/orders/export${exportQuery ? `?${exportQuery}` : ""}`} className={secondaryButtonClass}><Download className="h-4 w-4" /> Export CSV</a>
            <Link href="/admin/orders/new" className={buttonClass}><Plus className="h-4 w-4" /> New order</Link>
          </>
        }
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1 ${!status ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>All ({total})</Link>
        {orderStatuses.filter((value) => countFor(value) > 0).map((value) => (
          <Link key={value} href={`/admin/orders?status=${value}`} className={`rounded-full px-3 py-1 ${status === value ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
            {humanize(value)} ({countFor(value)})
          </Link>
        ))}
      </div>

      <SearchBar placeholder="Search order #, product, customer" defaultValue={q}>
        <select name="status" defaultValue={status} className={`${inputClass} w-48`}>
          <option value="">Any status</option>
          {orderStatuses.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}
        </select>
      </SearchBar>

      {orders.length === 0 ? (
        <EmptyState title={q || status ? "No orders match these filters" : "No orders yet"} description="Create an order manually, or convert a customer inquiry into an order.">
          <Link href="/admin/orders/new" className={buttonClass}>New order</Link>
        </EmptyState>
      ) : (
        <Table head={["Order", "Customer", "Product", "Amount", "Status", "Date"]}>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-slate-800/40">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${order.id}`} className="font-medium text-white hover:text-cyan-300">{order.orderNumber}</Link>
                {order.priority === "high" && <span className="ml-2"><Badge tone="rose">High priority</Badge></span>}
              </td>
              <td className="px-4 py-3">
                {order.customer ? <Link href={`/admin/customers/${order.customer.id}`} className="hover:text-cyan-300">{order.customer.name}</Link> : <span className="text-slate-500">—</span>}
              </td>
              <td className="px-4 py-3 text-slate-300">{order.productName ?? "—"}</td>
              <td className="px-4 py-3">{formatCurrency(order.finalAmount)}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(order.status)}>{humanize(order.status)}</Badge></td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
