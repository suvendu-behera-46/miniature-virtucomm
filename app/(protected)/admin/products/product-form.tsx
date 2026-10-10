import type { Category, Product } from "@prisma/client";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Checkbox, Field, inputClass } from "@/components/admin/ui";
import { toNumber } from "@/lib/format";
import { saveProduct } from "./actions";

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  return (
    <ActionForm action={saveProduct} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="space-y-6">
        <Card title="Details">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product name" className="md:col-span-2">
              <input name="name" required maxLength={160} defaultValue={product?.name} className={inputClass} placeholder="Custom Couple Miniature" />
            </Field>
            <Field label="Headline" hint="Short line shown under the name." className="md:col-span-2">
              <input name="shortDescription" maxLength={300} defaultValue={product?.shortDescription ?? ""} className={inputClass} />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <textarea name="fullDescription" rows={5} maxLength={5000} defaultValue={product?.fullDescription ?? ""} className={inputClass} />
            </Field>
            <Field label="Features" hint="One per line. Shown as a checklist on the product page." className="md:col-span-2">
              <textarea name="features" rows={4} maxLength={3000} defaultValue={product?.features ?? ""} className={inputClass} placeholder={"Premium hand-painted finish\nFree nationwide delivery"} />
            </Field>
            <Field label="Material">
              <input name="material" maxLength={120} defaultValue={product?.material ?? ""} className={inputClass} />
            </Field>
            <Field label="Production time">
              <input name="productionTime" maxLength={120} defaultValue={product?.productionTime ?? ""} className={inputClass} placeholder="12–18 working days" />
            </Field>
          </div>
        </Card>

        <Card title={product ? "Add images" : "Images"}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Upload images" hint="JPG, PNG, WebP or GIF, up to 12 MB each.">
              <input name="images" type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-slate-200`} />
            </Field>
            <Field label="…or image URL" hint="Paste an https:// link or a /media/ path from the Media Library.">
              <input name="imageUrl" maxLength={1000} className={inputClass} placeholder="https://" />
            </Field>
          </div>
        </Card>

        <Card title="Search engine listing">
          <div className="grid gap-4">
            <Field label="SEO title">
              <input name="seoTitle" maxLength={160} defaultValue={product?.seoTitle ?? ""} className={inputClass} />
            </Field>
            <Field label="SEO description">
              <textarea name="seoDescription" rows={2} maxLength={320} defaultValue={product?.seoDescription ?? ""} className={inputClass} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card title="Pricing">
          <div className="grid gap-4">
            <Field label="Price (₹)">
              <input name="basePrice" required inputMode="decimal" defaultValue={product ? toNumber(product.basePrice) : ""} className={inputClass} placeholder="5999" />
            </Field>
            <Field label="Compare-at price (₹)" hint="Optional. Shown struck through.">
              <input name="comparePrice" inputMode="decimal" defaultValue={product?.comparePrice ? toNumber(product.comparePrice) : ""} className={inputClass} />
            </Field>
            <Field label="SKU">
              <input name="sku" maxLength={60} defaultValue={product?.sku ?? ""} className={inputClass} />
            </Field>
          </div>
        </Card>

        <Card title="Organisation">
          <div className="grid gap-4">
            <Field label="Category">
              <select name="categoryId" defaultValue={product?.categoryId ?? ""} className={inputClass}>
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </Field>
            <Field label="URL slug" hint="Leave blank to generate from the name.">
              <input name="slug" maxLength={80} defaultValue={product?.slug ?? ""} className={inputClass} />
            </Field>
            <div className="grid gap-2">
              <Checkbox name="active" label="Published on the store" defaultChecked={product?.active ?? true} />
              <Checkbox name="featured" label="Featured on the home page" defaultChecked={product?.featured} />
              <Checkbox name="popular" label="Popular badge" defaultChecked={product?.popular} />
              <Checkbox name="newProduct" label="New badge" defaultChecked={product?.newProduct} />
            </div>
          </div>
        </Card>

        <SubmitButton className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60 inline-flex items-center justify-center gap-2">
          {product ? "Save changes" : "Create product"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
