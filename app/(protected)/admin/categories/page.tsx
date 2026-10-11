import Link from "next/link";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Checkbox, EmptyState, Field, inputClass, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { deleteCategory, saveCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Catalog" title="Categories" description="Group products on the storefront. Deleting a category keeps its products, uncategorised." />

      <Card title="Create category">
        <ActionForm action={saveCategory} resetOnSuccess className="grid gap-4 md:grid-cols-[1fr_1fr_120px_auto] md:items-end">
          <Field label="Name"><input name="name" required maxLength={80} className={inputClass} placeholder="Wedding" /></Field>
          <Field label="Description"><input name="description" maxLength={500} className={inputClass} /></Field>
          <Field label="Order"><input name="displayOrder" type="number" defaultValue={categories.length} className={inputClass} /></Field>
          <SubmitButton>Create</SubmitButton>
        </ActionForm>
      </Card>

      {categories.length === 0 ? (
        <EmptyState title="No categories yet" description="Create one above, then assign products to it." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.id}>
              <ActionForm action={saveCategory} className="grid gap-3">
                <input type="hidden" name="id" value={category.id} />
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/admin/products?category=${category.id}`} className="text-sm text-cyan-300 hover:text-cyan-200">
                    {category._count.products} product{category._count.products === 1 ? "" : "s"}
                  </Link>
                  <Badge tone={category.active ? "green" : "slate"}>{category.active ? "Active" : "Hidden"}</Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name"><input name="name" required maxLength={80} defaultValue={category.name} className={inputClass} /></Field>
                  <Field label="Slug"><input name="slug" maxLength={80} defaultValue={category.slug} className={inputClass} /></Field>
                </div>
                <Field label="Description"><input name="description" maxLength={500} defaultValue={category.description ?? ""} className={inputClass} /></Field>
                <div className="flex gap-3">
                  {category.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={category.coverImage} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="grid h-20 w-24 shrink-0 place-items-center rounded-lg bg-slate-800 px-2 text-center text-[10px] text-slate-500">Uses first product image</span>
                  )}
                  <div className="grid flex-1 gap-2">
                    <Field label="Cover image (shown on the home page)">
                      <input name="coverFile" type="file" accept="image/jpeg,image/png,image/webp" className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-slate-200`} />
                    </Field>
                    <input name="coverImage" maxLength={1000} placeholder="…or paste an https:// or /media/ URL" className={inputClass} />
                    {category.coverImage && <Checkbox name="removeCover" label="Remove cover image" />}
                  </div>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div className="flex items-end gap-4">
                    <Field label="Order"><input name="displayOrder" type="number" defaultValue={category.displayOrder} className={`${inputClass} w-24`} /></Field>
                    <Checkbox name="active" label="Active" defaultChecked={category.active} />
                  </div>
                  <SubmitButton className={secondaryButtonClass}>Save</SubmitButton>
                </div>
              </ActionForm>
              <div className="mt-3 border-t border-slate-800 pt-3 text-right">
                <ActionButton action={deleteCategory} fields={{ id: category.id }} danger confirmMessage={`Delete “${category.name}”? Its products will become uncategorised.`}>Delete</ActionButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
