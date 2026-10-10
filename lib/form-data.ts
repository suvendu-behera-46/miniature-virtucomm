export class FormError extends Error {}

export function text(formData: FormData, name: string, { max = 500, required = false, label = name } = {}) {
  const raw = formData.get(name);
  const value = typeof raw === "string" ? raw.trim() : "";
  if (required && !value) throw new FormError(`${label} is required.`);
  if (value.length > max) throw new FormError(`${label} must be ${max} characters or fewer.`);
  return value;
}

export function optionalText(formData: FormData, name: string, options: { max?: number; label?: string } = {}) {
  return text(formData, name, options) || null;
}

export function bool(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

export function money(formData: FormData, name: string, { required = false, label = name } = {}) {
  const value = text(formData, name, { max: 20, required, label }).replace(/[,₹\s]/g, "");
  if (!value) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 99_999_999) throw new FormError(`${label} must be a valid amount.`);
  return number.toFixed(2);
}

export function integer(formData: FormData, name: string, fallback = 0) {
  const value = Number.parseInt(text(formData, name, { max: 12 }), 10);
  return Number.isFinite(value) ? value : fallback;
}

export function optionalEmail(formData: FormData, name: string) {
  const value = text(formData, name, { max: 254 }).toLowerCase();
  if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new FormError("Enter a valid email address.");
  return value || null;
}

export function toErrorState(error: unknown, fallback: string) {
  if (error instanceof FormError) return { error: error.message };
  if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
    return { error: "That value is already in use. Choose a different one." };
  }
  // Let Next.js redirects and other framework signals propagate.
  if (error && typeof error === "object" && "digest" in error) throw error;
  console.error(fallback, error);
  return { error: fallback };
}
