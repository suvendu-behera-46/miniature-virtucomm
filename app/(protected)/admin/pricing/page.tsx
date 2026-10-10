import Link from "next/link";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, EmptyState, Field, inputClass, PageHeader, secondaryButtonClass, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import prisma from "@/lib/prisma";
import { createCoupon, deleteCoupon, toggleCoupon, updateProductPrice } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  await requireAdmin();
  const [products, coupons] = await Promise.all([
    prisma.product.findMany({ orderBy: { name: "asc" }, include: { category: true } }),
    prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),
  ]);
  const now = new Date();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sales" title="Pricing & coupons" description="Update product prices in one place and manage discount codes." />

      <Card title="Product prices">
        {products.length === 0 ? (
          <p className="text-sm text-slate-400">No products yet. <Link href="/admin/products/new" className="text-cyan-300">Create one</Link>.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {products.map((product) => (
              <ActionForm key={product.id} action={updateProductPrice} className="grid items-center gap-3 py-3 md:grid-cols-[1fr_150px_150px_90px]">
                <input type="hidden" name="id" value={product.id} />
                <div>
                  <Link href={`/admin/products/${product.id}`} className="font-medium text-white hover:text-cyan-300">{product.name}</Link>
                  <p className="text-xs text-slate-500">{product.category?.name ?? "Uncategorised"}{product.active ? "" : " · hidden"}</p>
                </div>
                <label className="text-xs text-slate-400">Price ₹<input name="basePrice" required inputMode="decimal" defaultValue={toNumber(product.basePrice)} className={`${inputClass} mt-1`} /></label>
                <label className="text-xs text-slate-400">Compare-at ₹<input name="comparePrice" inputMode="decimal" defaultValue={product.comparePrice ? toNumber(product.comparePrice) : ""} className={`${inputClass} mt-1`} /></label>
                <SubmitButton className={`${secondaryButtonClass} md:mt-5`}>Save</SubmitButton>
              </ActionForm>
            ))}
          </div>
        )}
      </Card>

      <Card title="Create coupon">
        <ActionForm action={createCoupon} resetOnSuccess className="grid gap-4 md:grid-cols-4">
          <Field label="Code"><input name="code" required maxLength={30} className={`${inputClass} uppercase`} placeholder="DIWALI10" /></Field>
          <Field label="Type">
            <select name="discountType" className={inputClass}>
              <option value="PERCENTAGE">Percentage off</option>
              <option value="FIXED">Fixed amount off (₹)</option>
            </select>
          </Field>
          <Field label="Value"><input name="value" required inputMode="decimal" className={inputClass} placeholder="10" /></Field>
          <Field label="Usage limit" hint="Blank for unlimited"><input name="usageLimit" type="number" min={1} className={inputClass} /></Field>
          <Field label="Minimum order (₹)"><input name="minimumOrder" inputMode="decimal" className={inputClass} /></Field>
          <Field label="Maximum discount (₹)"><input name="maximumDiscount" inputMode="decimal" className={inputClass} /></Field>
          <Field label="Starts"><input name="startDate" type="date" className={inputClass} /></Field>
          <Field label="Ends"><input name="endDate" type="date" className={inputClass} /></Field>
          <div><SubmitButton>Create coupon</SubmitButton></div>
        </ActionForm>
      </Card>

      {coupons.length === 0 ? (
        <EmptyState title="No coupons yet" description="Coupons you create can be applied as discounts when recording orders." />
      ) : (
        <Table head={["Code", "Discount", "Conditions", "Valid", "Status", ""]}>
          {coupons.map((coupon) => {
            const expired = coupon.endDate && coupon.endDate < now;
            return (
              <tr key={coupon.id}>
                <td className="px-4 py-3 font-mono font-semibold text-white">{coupon.code}</td>
                <td className="px-4 py-3">{coupon.discountType === "PERCENTAGE" ? `${toNumber(coupon.percentage)}% off` : `${formatCurrency(coupon.fixedAmount)} off`}</td>
                <td className="px-4 py-3 text-slate-400">
                  {[coupon.minimumOrder && `Min ${formatCurrency(coupon.minimumOrder)}`, coupon.maximumDiscount && `Max ${formatCurrency(coupon.maximumDiscount)}`, coupon.usageLimit && `${coupon.usageLimit} uses`].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                  {coupon.startDate ? formatDate(coupon.startDate) : "Now"} – {coupon.endDate ? formatDate(coupon.endDate) : "No end"}
                </td>
                <td className="px-4 py-3"><Badge tone={expired ? "rose" : coupon.active ? "green" : "slate"}>{expired ? "Expired" : coupon.active ? "Active" : "Paused"}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <ActionButton action={toggleCoupon} fields={{ id: coupon.id, active: coupon.active ? "false" : "true" }} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500">
                      {coupon.active ? "Pause" : "Activate"}
                    </ActionButton>
                    <ActionButton action={deleteCoupon} fields={{ id: coupon.id }} confirmMessage={`Delete coupon ${coupon.code}?`} className="rounded-lg border border-rose-500/40 px-3 py-1.5 text-xs text-rose-300 hover:bg-rose-500/10">Delete</ActionButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      )}
    </div>
  );
}
