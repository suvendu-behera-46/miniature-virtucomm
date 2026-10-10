import "server-only";

import prisma from "@/lib/prisma";

type InquiryInput = {
  name: string;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message: string;
  source: "CONTACT_FORM" | "REFERENCE_UPLOAD" | "MANUAL";
  referenceSubmissionId?: string | null;
};

// Saves an inquiry and links it to a customer record (matched by email,
// created if new) so the admin sees every person who has been in touch.
export async function recordInquiry(input: InquiryInput) {
  const email = input.email?.trim().toLowerCase() || null;
  const phone = input.phone?.trim() || null;

  let customerId: string | null = null;
  if (email) {
    const customer = await prisma.customer.upsert({
      where: { email },
      create: { email, name: input.name, phone },
      update: {},
      select: { id: true, phone: true },
    });
    customerId = customer.id;
    if (phone && !customer.phone) await prisma.customer.update({ where: { id: customer.id }, data: { phone } });
  }

  return prisma.contactInquiry.create({
    data: {
      customerId,
      name: input.name,
      email,
      phone,
      subject: input.subject || null,
      message: input.message,
      source: input.source,
      referenceSubmissionId: input.referenceSubmissionId || null,
    },
  });
}
