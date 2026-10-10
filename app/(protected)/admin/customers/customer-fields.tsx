import type { Customer } from "@prisma/client";
import { Field, inputClass } from "@/components/admin/ui";

export function CustomerFields({ customer }: { customer?: Customer }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Name"><input name="name" required maxLength={120} defaultValue={customer?.name} className={inputClass} /></Field>
      <Field label="Email"><input name="email" type="email" maxLength={254} defaultValue={customer?.email ?? ""} className={inputClass} /></Field>
      <Field label="Phone"><input name="phone" maxLength={30} defaultValue={customer?.phone ?? ""} className={inputClass} /></Field>
      <Field label="Address"><input name="addressLine1" maxLength={200} defaultValue={customer?.addressLine1 ?? ""} className={inputClass} /></Field>
      <Field label="Address line 2"><input name="addressLine2" maxLength={200} defaultValue={customer?.addressLine2 ?? ""} className={inputClass} /></Field>
      <Field label="City"><input name="city" maxLength={80} defaultValue={customer?.city ?? ""} className={inputClass} /></Field>
      <Field label="State"><input name="state" maxLength={80} defaultValue={customer?.state ?? ""} className={inputClass} /></Field>
      <Field label="Postal code"><input name="postalCode" maxLength={20} defaultValue={customer?.postalCode ?? ""} className={inputClass} /></Field>
      <Field label="Country"><input name="country" maxLength={80} defaultValue={customer?.country ?? "India"} className={inputClass} /></Field>
      <Field label="Internal notes" className="md:col-span-2"><textarea name="notes" rows={3} maxLength={3000} defaultValue={customer?.notes ?? ""} className={inputClass} /></Field>
    </div>
  );
}
