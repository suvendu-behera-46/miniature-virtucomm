import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, EmptyState, Field, inputClass, PageHeader, SearchBar, statusTone, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate, humanize, inquirySources, inquiryStatuses } from "@/lib/format";
import prisma from "@/lib/prisma";
import { createInquiry } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; source?: string; new?: string }> }) {
  await requireAdmin();
  const { q = "", status = "", source = "", new: showNew } = await searchParams;

  const [inquiries, counts] = await Promise.all([
    prisma.contactInquiry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(source ? { source } : {}),
        ...(q ? { OR: ["name", "email", "phone", "subject", "message"].map((field) => ({ [field]: { contains: q, mode: "insensitive" as const } })) } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.contactInquiry.groupBy({ by: ["status"], _count: true }),
  ]);
  const countFor = (value: string) => counts.find((row) => row.status === value)?._count ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Inquiries"
        description="Messages from the contact form and reference-image submissions. Convert one into an order when the customer confirms."
        actions={<Link href={showNew ? "/admin/inquiries" : "/admin/inquiries?new=1"} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">{showNew ? "Close" : "Log inquiry"}</Link>}
      />

      {showNew && (
        <Card title="Log a phone or WhatsApp inquiry">
          <ActionForm action={createInquiry} className="grid gap-4 md:grid-cols-3">
            <Field label="Name"><input name="name" required maxLength={120} className={inputClass} /></Field>
            <Field label="Email"><input name="email" type="email" maxLength={254} className={inputClass} /></Field>
            <Field label="Phone"><input name="phone" maxLength={30} className={inputClass} /></Field>
            <Field label="Subject" className="md:col-span-3"><input name="subject" maxLength={200} className={inputClass} /></Field>
            <Field label="Message" className="md:col-span-3"><textarea name="message" required rows={3} maxLength={5000} className={inputClass} /></Field>
            <div><SubmitButton>Save inquiry</SubmitButton></div>
          </ActionForm>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/admin/inquiries" className={`rounded-full px-3 py-1 ${!status ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>All</Link>
        {inquiryStatuses.map((value) => (
          <Link key={value} href={`/admin/inquiries?status=${value}`} className={`rounded-full px-3 py-1 ${status === value ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
            {humanize(value)} ({countFor(value)})
          </Link>
        ))}
      </div>

      <SearchBar placeholder="Search name, email, phone or message" defaultValue={q}>
        <select name="source" defaultValue={source} className={`${inputClass} w-48`}>
          <option value="">Any source</option>
          {Object.entries(inquirySources).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        {status && <input type="hidden" name="status" value={status} />}
      </SearchBar>

      {inquiries.length === 0 ? (
        <EmptyState title="No inquiries found" description="Contact-form messages and image submissions will appear here." />
      ) : (
        <Table head={["From", "Message", "Source", "Status", "Received"]}>
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="hover:bg-slate-800/40">
              <td className="px-4 py-3">
                <Link href={`/admin/inquiries/${inquiry.id}`} className="font-medium text-white hover:text-cyan-300">{inquiry.name}</Link>
                <span className="block text-xs text-slate-400">{inquiry.email ?? inquiry.phone}</span>
              </td>
              <td className="max-w-md px-4 py-3 text-slate-300">
                {inquiry.subject && <span className="block font-medium text-slate-200">{inquiry.subject}</span>}
                <span className="line-clamp-2">{inquiry.message}</span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">{inquirySources[inquiry.source] ?? inquiry.source}</td>
              <td className="px-4 py-3"><Badge tone={statusTone(inquiry.status)}>{humanize(inquiry.status)}</Badge></td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(inquiry.createdAt, true)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
