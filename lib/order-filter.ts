import type { OrderStatus, Prisma } from "@prisma/client";
import { orderStatuses } from "@/lib/format";

export function buildOrderFilter(q: string, status: string): Prisma.OrderWhereInput {
  return {
    ...(status && orderStatuses.includes(status as OrderStatus) ? { status: status as OrderStatus } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            { productName: { contains: q, mode: "insensitive" } },
            { customer: { name: { contains: q, mode: "insensitive" } } },
            { customer: { email: { contains: q, mode: "insensitive" } } },
            { customer: { phone: { contains: q } } },
          ],
        }
      : {}),
  };
}
