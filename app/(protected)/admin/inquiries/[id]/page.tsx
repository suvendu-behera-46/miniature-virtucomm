import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Mail, Phone, ShoppingCart } from "lucide-react";
import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, buttonClass, Card, Field, inputClass, PageHeader, secondaryButtonClass, statusTone } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate, humanize, inquirySources, inquiryStatuses } from "@/lib/format";
import prisma from "@/lib/prisma";
import { readSubmission } from "@/lib/reference-uploads";
import { deleteInquiry, updateInquiry } from "../actions";

export const dynamic = "force-dynamic";

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const inquiry = await prisma.contactInquiry.findUnique({ where: { id }, include: { customer: true } });
  if (!inquiry) notFound();

  const submission = inquiry.referenceSubmissionId ? await readSubmission(inquiry.referenceSubmissionId).catch(() => null) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={inquirySources[inquiry.source] ?? "Inquiry"}
        title={inquiry.subject || `Inquiry from ${inquiry.name}`}
        description={`Received ${formatDate(inquiry.createdAt, true)}`}
        actions={
          <>
            <Link href={`/admin/orders/new?inquiry=${inquiry.id}`} className={buttonClass}><ShoppingCart className="h-4 w-4" /> Convert to order</Link>
            <Link href="/admin/inquiries" className={secondaryButtonClass}>All inquiries</Link>
            <ActionButton action={deleteInquiry} fields={{ id: inquiry.id }} danger confirmMessage="Delete this inquiry?">Delete</ActionButton>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card title="Message" actions={<Badge tone={statusTone(inquiry.status)}>{humanize(inquiry.status)}</Badge>}>
            <p className="whitespace-pre-wrap text-slate-200">{inquiry.message}</p>
          </Card>

          {submission && (
            <Card title={`Reference images (${submission.files.length})`}>
              <ul className="flex flex-wrap gap-2">
                {submission.files.map((file) => (
                  <li key={file.id}>
                    <a href={`/api/admin/reference-uploads/${submission.id}/${file.id}`} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-cyan-500">
                      <Download className="h-4 w-4 text-cyan-400" /> {file.originalName}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card title="Follow-up">
            <ActionForm action={updateInquiry} className="grid gap-4">
              <input type="hidden" name="id" value={inquiry.id} />
              <Field label="Status">
                <select name="status" defaultValue={inquiry.status} className={`${inputClass} max-w-xs`}>
                  {inquiryStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}
                </select>
              </Field>
              <Field label="Internal notes"><textarea name="notes" rows={4} maxLength={5000} defaultValue={inquiry.notes ?? ""} className={inputClass} placeholder="Called on 12 Oct, sending quote…" /></Field>
              <div><SubmitButton>Save</SubmitButton></div>
            </ActionForm>
          </Card>
        </div>

        <Card title="Contact">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-white">{inquiry.name}</p>
            {inquiry.email && <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200"><Mail className="h-4 w-4" />{inquiry.email}</a>}
            {inquiry.phone && <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200"><Phone className="h-4 w-4" />{inquiry.phone}</a>}
            {inquiry.customer && (
              <Link href={`/admin/customers/${inquiry.customer.id}`} className="mt-3 inline-block text-cyan-300 hover:text-cyan-200">View customer profile →</Link>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
