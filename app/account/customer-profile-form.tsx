"use client";

import { useActionState } from "react";
import { saveCustomerProfile, type CustomerProfileState } from "./profile-actions";

type ProfileValues = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialState: CustomerProfileState = {};

export function CustomerProfileForm({ profile }: { profile: ProfileValues }) {
  const [state, formAction, pending] = useActionState(saveCustomerProfile, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" defaultValue={profile.name} required />
        <Field label="Phone number" name="phone" type="tel" autoComplete="tel" defaultValue={profile.phone} placeholder="+91 98765 43210" required />
        <div className="sm:col-span-2">
          <Field label="Address line 1" name="addressLine1" autoComplete="address-line1" defaultValue={profile.addressLine1} required />
        </div>
        <div className="sm:col-span-2">
          <Field label="Address line 2" name="addressLine2" autoComplete="address-line2" defaultValue={profile.addressLine2} />
        </div>
        <Field label="City" name="city" autoComplete="address-level2" defaultValue={profile.city} required />
        <Field label="State / region" name="state" autoComplete="address-level1" defaultValue={profile.state} required />
        <Field label="Postal code" name="postalCode" autoComplete="postal-code" defaultValue={profile.postalCode} required />
        <Field label="Country" name="country" autoComplete="country-name" defaultValue={profile.country || "India"} required />
      </div>

      {state.error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.error}</p>}

      <button type="submit" disabled={pending} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Saving details…" : "Save details"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  autoComplete,
  required,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  autoComplete: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}{required && <span className="ml-1 text-rose-700">*</span>}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-700 focus:ring-2 focus:ring-cyan-700/15"
      />
    </label>
  );
}
