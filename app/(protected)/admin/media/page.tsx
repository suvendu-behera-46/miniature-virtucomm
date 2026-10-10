import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { CopyButton } from "@/components/admin/copy-button";
import { Card, EmptyState, inputClass, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import prisma from "@/lib/prisma";
import { deleteMedia, uploadMedia } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  await requireAdmin();
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Content" title="Media library" description="Upload images once and reuse their links in products, the gallery, and testimonials." />

      <Card title="Upload images">
        <ActionForm action={uploadMedia} resetOnSuccess className="flex flex-wrap items-center gap-3">
          <input name="files" type="file" multiple required accept="image/jpeg,image/png,image/webp,image/gif" className={`${inputClass} max-w-md file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-slate-200`} />
          <SubmitButton>Upload</SubmitButton>
          <span className="text-xs text-slate-500">JPG, PNG, WebP or GIF · up to 12 MB each · 20 at a time</span>
        </ActionForm>
      </Card>

      {assets.length === 0 ? (
        <EmptyState title="No media yet" description="Uploaded images will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => (
            <div key={asset.id} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt={asset.filename} className="h-40 w-full object-cover" />
              <div className="space-y-2 p-3">
                <p className="truncate text-sm text-white" title={asset.filename}>{asset.filename}</p>
                <p className="text-xs text-slate-500">{asset.size ? `${(asset.size / 1024 / 1024).toFixed(1)} MB · ` : ""}{formatDate(asset.createdAt)}</p>
                <div className="flex flex-wrap gap-2">
                  <CopyButton value={asset.url} />
                  <ActionButton action={deleteMedia} fields={{ id: asset.id }} confirmMessage="Delete this image? Anything using its link will show a broken image." className="rounded-lg border border-rose-500/40 px-2 py-1 text-xs text-rose-300 hover:bg-rose-500/10">Delete</ActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
