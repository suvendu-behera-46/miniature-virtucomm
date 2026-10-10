import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Field, inputClass, PageHeader, secondaryButtonClass, statusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, formatDate, humanize, orderStatuses, toNumber } from "@/lib/format";
import prisma from "@/lib/prisma";
import { addOrderNote, deleteOrder, updateOrderDetails, updateOrderStatus } from "../actions";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } },
      notes: { include: { admin: true }, orderBy: { createdAt: "desc" } },
      statusHistory: { include: { changedBy: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Order"
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt, true)}`}
        actions={
          <>
            <Link href="/admin/orders" className={secondaryButtonClass}>All orders</Link>
            <ActionButton action={deleteOrder} fields={{ id: order.id }} danger confirmMessage={`Delete order ${order.orderNumber}? This cannot be undone.`}>Delete</ActionButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Status" actions={<Badge tone={statusTone(order.status)}>{humanize(order.status)}</Badge>}>
            <ActionForm action={updateOrderStatus} className="grid gap-3 md:grid-cols-[220px_1fr_auto] md:items-end">
              <input type="hidden" name="id" value={order.id} />
              <Field label="New status">
                <select name="status" defaultValue={order.status} className={inputClass}>
                  {orderStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
                </select>
              </Field>
              <Field label="Note (optional)"><input name="note" maxLength={1000} className={inputClass} placeholder="e.g. Design preview sent on WhatsApp" /></Field>
              <SubmitButton>Update</SubmitButton>
            </ActionForm>

            <ol className="mt-5 space-y-3 border-l border-slate-800 pl-4">
              {order.statusHistory.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="text-white">
                    {entry.oldStatus ? `${humanize(entry.oldStatus)} → ` : ""}<span className="font-medium">{humanize(entry.newStatus)}</span>
                  </p>
                  {entry.note && <p className="text-slate-300">{entry.note}</p>}
                  <p className="text-xs text-slate-500">{formatDate(entry.createdAt, true)}{entry.changedBy ? ` · ${entry.changedBy.name}` : ""}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="Order details">
            <ActionForm action={updateOrderDetails} className="grid gap-4 md:grid-cols-2">
              <input type="hidden" name="id" value={order.id} />
              <Field label="Product / description" className="md:col-span-2"><input name="productName" maxLength={200} defaultValue={order.productName ?? ""} className={inputClass} /></Field>
              <Field label="Subtotal (₹)"><input name="amount" required inputMode="decimal" defaultValue={toNumber(order.amount)} className={inputClass} /></Field>
              <Field label="Discount (₹)"><input name="discount" inputMode="decimal" defaultValue={toNumber(order.discount)} className={inputClass} /></Field>
              <Field label="Priority">
                <select name="priority" defaultValue={order.priority} className={inputClass}>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <div className="flex items-end"><p className="text-sm text-slate-300">Total: <span className="text-lg font-bold text-white">{formatCurrency(order.finalAmount)}</span></p></div>
              <Field label="Shipping address" className="md:col-span-2"><textarea name="shippingAddress" rows={2} maxLength={500} defaultValue={order.shippingAddress ?? ""} className={inputClass} /></Field>
              <Field label="Special instructions" className="md:col-span-2"><textarea name="specialInstructions" rows={3} maxLength={3000} defaultValue={order.specialInstructions ?? ""} className={inputClass} /></Field>
              <div><SubmitButton>Save details</SubmitButton></div>
            </ActionForm>

            {order.items.length > 0 && (
              <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Items</p>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-slate-300">
                    <span>
                      {item.product ? <Link href={`/admin/products/${item.product.id}`} className="text-cyan-300 hover:text-cyan-200">{item.product.name}</Link> : order.productName} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.totalPrice)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Customer">
            {order.customer ? (
              <div className="space-y-1 text-sm">
                <Link href={`/admin/customers/${order.customer.id}`} className="font-medium text-white hover:text-cyan-300">{order.customer.name}</Link>
                {order.customer.email && <a href={`mailto:${order.customer.email}`} className="block text-cyan-300">{order.customer.email}</a>}
                {order.customer.phone && <a href={`tel:${order.customer.phone}`} className="block text-cyan-300">{order.customer.phone}</a>}
                {order.customer.addressLine1 && (
                  <p className="pt-2 text-slate-400">
                    {[order.customer.addressLine1, order.customer.addressLine2, order.customer.city, order.customer.state, order.customer.postalCode].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No customer linked.</p>
            )}
          </Card>

          <Card title="Internal notes">
            <ActionForm action={addOrderNote} resetOnSuccess className="space-y-2">
              <input type="hidden" name="id" value={order.id} />
              <textarea name="message" required rows={3} maxLength={3000} className={inputClass} placeholder="Only visible to your team" />
              <SubmitButton>Add note</SubmitButton>
            </ActionForm>
            <ul className="mt-4 space-y-3">
              {order.notes.map((note) => (
                <li key={note.id} className="rounded-xl bg-slate-950 p-3 text-sm">
                  <p className="whitespace-pre-wrap text-slate-200">{note.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{note.admin?.name ?? "Admin"} · {formatDate(note.createdAt, true)}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
