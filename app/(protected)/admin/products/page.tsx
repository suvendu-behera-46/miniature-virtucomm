import Link from "next/link";
import { Plus } from "lucide-react";
import { ActionButton } from "@/components/admin/action-form";
import { Badge, buttonClass, EmptyState, inputClass, PageHeader, SearchBar, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatCurrency } from "@/lib/format";
import prisma from "@/lib/prisma";
import { toggleProductActive } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; status?: string }> }) {
  await requireAdmin();
  const { q = "", category = "", status = "" } = await searchParams;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { categoryId: category } : {}),
        ...(status ? { active: status === "published" } : {}),
      },
      include: { category: true, images: { where: { isPrimary: true }, take: 1 }, _count: { select: { orderItems: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="Everything listed here appears on the storefront when published."
        actions={<Link href="/admin/products/new" className={buttonClass}><Plus className="h-4 w-4" /> Create product</Link>}
      />

      <SearchBar placeholder="Search name or SKU" defaultValue={q}>
        <select name="category" defaultValue={category} className={`${inputClass} w-44`}>
          <option value="">All categories</option>
          {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="status" defaultValue={status} className={`${inputClass} w-36`}>
          <option value="">Any status</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
      </SearchBar>

      {products.length === 0 ? (
        <EmptyState title={q || category || status ? "No products match these filters" : "No products yet"} description="Create your first product to show it on the store.">
          <Link href="/admin/products/new" className={buttonClass}>Create product</Link>
        </EmptyState>
      ) : (
        <Table head={["Product", "Category", "Price", "Orders", "Status", ""]}>
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/products/${product.id}`} className="flex items-center gap-3 font-medium text-white hover:text-cyan-300">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].url} alt="" className="h-11 w-11 rounded-lg object-cover" />
                  ) : (
                    <span className="h-11 w-11 rounded-lg bg-slate-800" />
                  )}
                  <span>
                    {product.name}
                    {product.sku && <span className="block text-xs font-normal text-slate-500">{product.sku}</span>}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-300">{product.category?.name ?? "—"}</td>
              <td className="px-4 py-3">{formatCurrency(product.basePrice)}</td>
              <td className="px-4 py-3 text-slate-300">{product._count.orderItems}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  <Badge tone={product.active ? "green" : "slate"}>{product.active ? "Published" : "Hidden"}</Badge>
                  {product.featured && <Badge tone="cyan">Featured</Badge>}
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <ActionButton action={toggleProductActive} fields={{ id: product.id }} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500">
                    {product.active ? "Hide" : "Publish"}
                  </ActionButton>
                  <Link href={`/admin/products/${product.id}`} className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-cyan-500">Edit</Link>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
