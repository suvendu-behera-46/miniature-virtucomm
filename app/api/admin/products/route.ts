import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { adminRoles, type AdminRole } from "@/lib/admin-auth";
import { toNumber } from "@/lib/format";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!adminRoles.includes((session?.user as { role?: string } | undefined)?.role as AdminRole)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { category: true } });
  return NextResponse.json({
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: toNumber(product.basePrice),
      category: product.category?.name ?? null,
      active: product.active,
    })),
  });
}
