import Link from "next/link";
import { PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Catalog" title="Create product" actions={<Link href="/admin/products" className={secondaryButtonClass}>Back to products</Link>} />
      <ProductForm categories={categories} />
    </div>
  );
}
