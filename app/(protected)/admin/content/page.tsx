import Link from "next/link";
import type { FAQ, GalleryImage, Testimonial } from "@prisma/client";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Checkbox, EmptyState, Field, inputClass, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { deleteContent, saveFaq, saveGalleryImage, saveTestimonial } from "./actions";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "testimonials", label: "Testimonials" },
  { key: "faqs", label: "FAQs" },
  { key: "gallery", label: "Gallery" },
] as const;

const fileInputClass = `${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-slate-200`;

export default async function AdminContentPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await requireAdmin();
  const { tab: tabParam } = await searchParams;
  const tab = tabs.some((item) => item.key === tabParam) ? tabParam! : "testimonials";

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Website content" description="Testimonials, FAQs and gallery photos shown on the home and gallery pages." />

      <div className="flex gap-2 border-b border-slate-800">
        {tabs.map((item) => (
          <Link key={item.key} href={`/admin/content?tab=${item.key}`} className={`-mb-px border-b-2 px-4 py-2 text-sm ${tab === item.key ? "border-cyan-400 text-white" : "border-transparent text-slate-400 hover:text-white"}`}>
            {item.label}
          </Link>
        ))}
      </div>

      {tab === "testimonials" && <TestimonialsTab items={await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } })} />}
      {tab === "faqs" && <FaqsTab items={await prisma.fAQ.findMany({ orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }] })} />}
      {tab === "gallery" && <GalleryTab items={await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })} />}
    </div>
  );
}

function DeleteButton({ id, kind }: { id: string; kind: string }) {
  return <ActionButton action={deleteContent} fields={{ id, kind }} danger confirmMessage="Delete this item?">Delete</ActionButton>;
}

function TestimonialFields({ item }: { item?: Testimonial }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Field label="Customer name"><input name="name" required maxLength={120} defaultValue={item?.name} className={inputClass} /></Field>
      <Field label="Product (optional)"><input name="product" maxLength={120} defaultValue={item?.product ?? ""} className={inputClass} /></Field>
      <Field label="Rating"><select name="rating" defaultValue={item?.rating ?? 5} className={inputClass}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}</select></Field>
      <Field label="Testimonial" className="md:col-span-3"><textarea name="testimonial" required rows={3} maxLength={2000} defaultValue={item?.testimonial} className={inputClass} /></Field>
      <Field label="Photo (optional)"><input name="image" type="file" accept="image/jpeg,image/png,image/webp" className={fileInputClass} /></Field>
      <div className="flex flex-wrap items-end gap-4 md:col-span-2">
        <Checkbox name="featured" label="Show on home page" defaultChecked={item?.featured ?? true} />
        {item && <Checkbox name="active" label="Active" defaultChecked={item.active} />}
      </div>
    </div>
  );
}

function TestimonialsTab({ items }: { items: Testimonial[] }) {
  return (
    <>
      <Card title="Add testimonial">
        <ActionForm action={saveTestimonial} resetOnSuccess className="space-y-4">
          <TestimonialFields />
          <SubmitButton>Add testimonial</SubmitButton>
        </ActionForm>
      </Card>
      {items.length === 0 ? <EmptyState title="No testimonials yet" /> : items.map((item) => (
        <Card key={item.id} actions={<div className="flex gap-2">{item.featured && <Badge tone="cyan">On home page</Badge>}<Badge tone={item.active ? "green" : "slate"}>{item.active ? "Active" : "Hidden"}</Badge></div>}>
          <ActionForm action={saveTestimonial} className="space-y-4">
            <input type="hidden" name="id" value={item.id} />
            <TestimonialFields item={item} />
            <div className="flex justify-between"><SubmitButton className={secondaryButtonClass}>Save</SubmitButton></div>
          </ActionForm>
          <div className="mt-3 text-right"><DeleteButton id={item.id} kind="testimonial" /></div>
        </Card>
      ))}
    </>
  );
}

function FaqFields({ item }: { item?: FAQ }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_120px]">
      <Field label="Question"><input name="question" required maxLength={300} defaultValue={item?.question} className={inputClass} /></Field>
      <Field label="Order"><input name="displayOrder" type="number" defaultValue={item?.displayOrder ?? 0} className={inputClass} /></Field>
      <Field label="Answer" className="md:col-span-2"><textarea name="answer" required rows={3} maxLength={3000} defaultValue={item?.answer} className={inputClass} /></Field>
      {item && <Checkbox name="active" label="Active" defaultChecked={item.active} />}
    </div>
  );
}

function FaqsTab({ items }: { items: FAQ[] }) {
  return (
    <>
      <Card title="Add FAQ">
        <ActionForm action={saveFaq} resetOnSuccess className="space-y-4">
          <FaqFields />
          <SubmitButton>Add FAQ</SubmitButton>
        </ActionForm>
      </Card>
      {items.length === 0 ? <EmptyState title="No FAQs yet" /> : items.map((item) => (
        <Card key={item.id} actions={<Badge tone={item.active ? "green" : "slate"}>{item.active ? "Active" : "Hidden"}</Badge>}>
          <ActionForm action={saveFaq} className="space-y-4">
            <input type="hidden" name="id" value={item.id} />
            <FaqFields item={item} />
            <SubmitButton className={secondaryButtonClass}>Save</SubmitButton>
          </ActionForm>
          <div className="mt-3 text-right"><DeleteButton id={item.id} kind="faq" /></div>
        </Card>
      ))}
    </>
  );
}

function GalleryFields({ item }: { item?: GalleryImage }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label={item ? "Replace image" : "Upload image"}><input name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className={fileInputClass} /></Field>
      <Field label="…or image URL"><input name="imageUrl" maxLength={1000} placeholder={item?.imageUrl ?? "https:// or /media/…"} className={inputClass} /></Field>
      <Field label="Title"><input name="title" maxLength={120} defaultValue={item?.title ?? ""} className={inputClass} /></Field>
      <Field label="Caption"><input name="caption" maxLength={300} defaultValue={item?.caption ?? ""} className={inputClass} /></Field>
      <div className="flex flex-wrap items-end gap-4 md:col-span-2">
        <Field label="Order"><input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} className={`${inputClass} w-24`} /></Field>
        <Checkbox name="featured" label="Show on home page" defaultChecked={item?.featured} />
        {item && <Checkbox name="active" label="Active" defaultChecked={item.active} />}
      </div>
    </div>
  );
}

function GalleryTab({ items }: { items: GalleryImage[] }) {
  return (
    <>
      <Card title="Add gallery photo">
        <ActionForm action={saveGalleryImage} resetOnSuccess className="space-y-4">
          <GalleryFields />
          <SubmitButton>Add photo</SubmitButton>
        </ActionForm>
      </Card>
      {items.length === 0 ? <EmptyState title="No gallery photos yet" /> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="mb-4 flex gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.title ?? ""} className="h-24 w-32 rounded-lg object-cover" />
                <div className="flex flex-wrap content-start gap-2">
                  {item.featured && <Badge tone="cyan">On home page</Badge>}
                  <Badge tone={item.active ? "green" : "slate"}>{item.active ? "Active" : "Hidden"}</Badge>
                </div>
              </div>
              <ActionForm action={saveGalleryImage} className="space-y-4">
                <input type="hidden" name="id" value={item.id} />
                <GalleryFields item={item} />
                <SubmitButton className={secondaryButtonClass}>Save</SubmitButton>
              </ActionForm>
              <div className="mt-3 text-right"><DeleteButton id={item.id} kind="gallery" /></div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
