import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Field, inputClass, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, humanize, orderStatuses } from "@/lib/format";
import prisma from "@/lib/prisma";
import { createOrder } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ customer?: string; inquiry?: string }> }) {
  await requireAdmin();
  const { customer: customerParam, inquiry: inquiryParam } = await searchParams;

  const [customers, products, inquiry] = await Promise.all([
    prisma.customer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true, phone: true }, take: 1000 }),
    prisma.product.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, basePrice: true, active: true } }),
    inquiryParam ? prisma.contactInquiry.findUnique({ where: { id: inquiryParam } }) : null,
  ]);
  const selectedCustomer = customerParam ?? inquiry?.customerId ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="New order"
        description={inquiry ? `Converting the inquiry from ${inquiry.name}. The inquiry will be marked as converted.` : "Record an order taken by phone, WhatsApp, email, or from an inquiry."}
        actions={<Link href="/admin/orders" className={secondaryButtonClass}>Back to orders</Link>}
      />

      <ActionForm action={createOrder} className="grid gap-6 xl:grid-cols-2">
        {inquiry && <input type="hidden" name="inquiryId" value={inquiry.id} />}
        <Card title="Customer">
          <div className="grid gap-4">
            <Field label="Existing customer">
              <select name="customerId" defaultValue={selectedCustomer} className={inputClass}>
                <option value="">— New customer (enter details below) —</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}{customer.email ? ` · ${customer.email}` : customer.phone ? ` · ${customer.phone}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <p className="text-xs text-slate-500">Or create a new customer (ignored if an existing customer is selected):</p>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Name"><input name="customerName" maxLength={120} defaultValue={selectedCustomer ? "" : inquiry?.name ?? ""} className={inputClass} /></Field>
              <Field label="Email"><input name="customerEmail" type="email" maxLength={254} defaultValue={selectedCustomer ? "" : inquiry?.email ?? ""} className={inputClass} /></Field>
              <Field label="Phone"><input name="customerPhone" maxLength={30} defaultValue={selectedCustomer ? "" : inquiry?.phone ?? ""} className={inputClass} /></Field>
            </div>
            <Field label="Shipping address"><textarea name="shippingAddress" rows={3} maxLength={500} className={inputClass} /></Field>
          </div>
        </Card>

        <Card title="Order">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product" className="md:col-span-2">
              <select name="productId" defaultValue="" className={inputClass}>
                <option value="">— Custom / not in catalog —</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name} · {formatCurrency(product.basePrice)}{product.active ? "" : " (hidden)"}</option>
                ))}
              </select>
            </Field>
            <Field label="Description" hint="Optional if a product is chosen." className="md:col-span-2">
              <input name="productName" maxLength={200} className={inputClass} placeholder="e.g. Family of 4 miniature, 8 inch" />
            </Field>
            <Field label="Quantity"><input name="quantity" type="number" min={1} max={100} defaultValue={1} className={inputClass} /></Field>
            <Field label="Unit price (₹)" hint="Leave blank to use the product price."><input name="unitPrice" inputMode="decimal" className={inputClass} /></Field>
            <Field label="Discount (₹)"><input name="discount" inputMode="decimal" defaultValue="0" className={inputClass} /></Field>
            <Field label="Priority">
              <select name="priority" defaultValue="normal" className={inputClass}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Status" className="md:col-span-2">
              <select name="status" defaultValue={inquiry?.source === "REFERENCE_UPLOAD" ? "PHOTO_REVIEW" : "NEW"} className={inputClass}>
                {orderStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
              </select>
            </Field>
            <Field label="Special instructions" className="md:col-span-2">
              <textarea name="specialInstructions" rows={4} maxLength={3000} defaultValue={inquiry?.message ?? ""} className={inputClass} />
            </Field>
          </div>
          <div className="mt-5"><SubmitButton>Create order</SubmitButton></div>
        </Card>
      </ActionForm>
    </div>
  );
}
