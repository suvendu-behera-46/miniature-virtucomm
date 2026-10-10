import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Plus } from "lucide-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, buttonClass, Card, PageHeader, secondaryButtonClass, statusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, formatDate, humanize, inquirySources } from "@/lib/format";
import prisma from "@/lib/prisma";
import { deleteCustomer, saveCustomer } from "../actions";
import { CustomerFields } from "../customer-fields";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      inquiries: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!customer) notFound();

  const lifetimeValue = customer.orders.filter((order) => order.status !== "CANCELLED").reduce((total, order) => total + Number(order.finalAmount), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Customer"
        title={customer.name}
        description={`Customer since ${formatDate(customer.createdAt)}`}
        actions={
          <>
            <Link href={`/admin/orders/new?customer=${customer.id}`} className={buttonClass}><Plus className="h-4 w-4" /> New order</Link>
            <Link href="/admin/customers" className={secondaryButtonClass}>All customers</Link>
            <ActionButton action={deleteCustomer} fields={{ id: customer.id }} danger confirmMessage={`Delete ${customer.name}? Their orders and inquiries are kept but unlinked.`}>Delete</ActionButton>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-400">Orders</p><p className="mt-1 text-2xl font-bold text-white">{customer.orders.length}</p></Card>
        <Card><p className="text-sm text-slate-400">Lifetime value</p><p className="mt-1 text-2xl font-bold text-white">{formatCurrency(lifetimeValue)}</p></Card>
        <Card>
          <p className="text-sm text-slate-400">Contact</p>
          <div className="mt-1 space-y-1 text-sm">
            {customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200"><Mail className="h-4 w-4" />{customer.email}</a>}
            {customer.phone && <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200"><Phone className="h-4 w-4" />{customer.phone}</a>}
            {!customer.email && !customer.phone && <p className="text-slate-500">No contact details</p>}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card title="Profile">
          <ActionForm action={saveCustomer} className="space-y-4">
            <input type="hidden" name="id" value={customer.id} />
            <CustomerFields customer={customer} />
            <SubmitButton>Save profile</SubmitButton>
          </ActionForm>
        </Card>

        <div className="space-y-6">
          <Card title={`Orders (${customer.orders.length})`}>
            {customer.orders.length === 0 ? (
              <p className="text-sm text-slate-400">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {customer.orders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-sm font-medium text-white hover:text-cyan-300">
                      {order.orderNumber}
                      <span className="block text-xs font-normal text-slate-500">{order.productName ?? "Custom order"} · {formatDate(order.createdAt)}</span>
                    </Link>
                    <div className="text-right text-sm">
                      <p>{formatCurrency(order.finalAmount)}</p>
                      <Badge tone={statusTone(order.status)}>{humanize(order.status)}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title={`Inquiries (${customer.inquiries.length})`}>
            {customer.inquiries.length === 0 ? (
              <p className="text-sm text-slate-400">No inquiries.</p>
            ) : (
              <ul className="divide-y divide-slate-800">
                {customer.inquiries.map((inquiry) => (
                  <li key={inquiry.id} className="py-3">
                    <Link href={`/admin/inquiries/${inquiry.id}`} className="flex items-start justify-between gap-3 hover:text-cyan-300">
                      <span className="text-sm text-white">
                        {inquiry.subject || inquirySources[inquiry.source] || "Inquiry"}
                        <span className="block line-clamp-1 text-xs text-slate-500">{inquiry.message}</span>
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
    </div>
  );
}
