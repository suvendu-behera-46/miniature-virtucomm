type Numeric = number | string | { toString(): string } | null | undefined;

const currencyFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function toNumber(value: Numeric): number {
  if (value === null || value === undefined) return 0;
  const number = Number(typeof value === "number" ? value : value.toString());
  return Number.isFinite(number) ? number : 0;
}

export function formatCurrency(value: Numeric) {
  return currencyFormatter.format(toNumber(value));
}

export function formatDate(value: Date | string, withTime = false) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  });
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const orderStatuses = [
  "NEW",
  "CONTACTED",
  "PHOTO_REVIEW",
  "DESIGNING",
  "DESIGN_PREVIEW",
  "REVISION_REQUESTED",
  "APPROVED",
  "IN_PRODUCTION",
  "PRINTING",
  "PAINTING",
  "QUALITY_CHECK",
  "READY_TO_SHIP",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatusValue = (typeof orderStatuses)[number];

export const inquiryStatuses = ["NEW", "CONTACTED", "CONVERTED", "CLOSED"] as const;
export type InquiryStatusValue = (typeof inquiryStatuses)[number];

export const inquirySources: Record<string, string> = {
  CONTACT_FORM: "Contact form",
  REFERENCE_UPLOAD: "Image submission",
  MANUAL: "Added by admin",
};

export function humanize(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
