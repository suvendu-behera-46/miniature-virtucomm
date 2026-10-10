import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ActionButton } from "@/components/admin/action-form";
import { Badge, Card, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { deleteProduct, deleteProductImage, setPrimaryProductImage } from "../actions";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { created } = await searchParams;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }] } } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={product.name}
        description={created ? "Product created. Add more images or details below." : undefined}
        actions={
          <>
            {product.active && (
              <Link href={`/product/${product.slug}`} target="_blank" className={secondaryButtonClass}><ExternalLink className="h-4 w-4" /> View on store</Link>
            )}
            <Link href="/admin/products" className={secondaryButtonClass}>Back to products</Link>
            <ActionButton action={deleteProduct} fields={{ id: product.id }} danger confirmMessage={`Delete "${product.name}"? This cannot be undone.`}>Delete</ActionButton>
          </>
        }
      />

      <Card title={`Images (${product.images.length})`}>
        {product.images.length === 0 ? (
          <p className="text-sm text-slate-400">No images yet. Upload some below; the first becomes the main image.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {product.images.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.altText ?? product.name} className="h-32 w-full object-cover" />
                <div className="flex flex-wrap items-center gap-2 p-2">
                  {image.isPrimary ? (
                    <Badge tone="cyan">Main image</Badge>
                  ) : (
                    <ActionButton action={setPrimaryProductImage} fields={{ imageId: image.id }} className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-cyan-500">Make main</ActionButton>
                  )}
                  <ActionButton action={deleteProductImage} fields={{ imageId: image.id }} confirmMessage="Remove this image?" className="rounded-lg border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Remove</ActionButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ProductForm product={product} categories={categories} />
    </div>
  );
}
