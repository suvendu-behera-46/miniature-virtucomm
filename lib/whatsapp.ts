// Builds a wa.me click-to-chat link. Numbers without a country code are
// treated as Indian (+91).
export function whatsappLink(number: string, message: string) {
  let digits = number.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
