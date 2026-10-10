import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, EmptyState, PageHeader, SearchBar, Table } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import prisma from "@/lib/prisma";
import { saveCustomer } from "./actions";
import { CustomerFields } from "./customer-fields";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; new?: string }> }) {
  await requireAdmin();
  const { q = "", new: showNew } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: q
      ? { OR: ["name", "email", "phone", "city"].map((field) => ({ [field]: { contains: q, mode: "insensitive" as const } })) }
      : {},
    include: { _count: { select: { orders: true, inquiries: true } } },
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CRM"
        title="Customers"
        description="Customers who signed in with Google, sent an inquiry or image, or were added by your team."
        actions={<Link href={showNew ? "/admin/customers" : "/admin/customers?new=1"} className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400">{showNew ? "Close" : "Add customer"}</Link>}
      />

      {showNew && (
        <Card title="New customer">
          <ActionForm action={saveCustomer} className="space-y-4">
            <CustomerFields />
            <SubmitButton>Create customer</SubmitButton>
          </ActionForm>
        </Card>
      )}

      <SearchBar placeholder="Search name, email, phone or city" defaultValue={q} />

      {customers.length === 0 ? (
        <EmptyState title={q ? "No customers match your search" : "No customers yet"} description="Customers appear here when they sign in, send an inquiry, or submit a reference image." />
      ) : (
        <Table head={["Customer", "Contact", "Location", "Orders", "Inquiries", "Since"]}>
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-slate-800/40">
              <td className="px-4 py-3">
                <Link href={`/admin/customers/${customer.id}`} className="font-medium text-white hover:text-cyan-300">{customer.name}</Link>
                {customer.profileCompletedAt && <span className="ml-2"><Badge tone="green">Profile complete</Badge></span>}
              </td>
              <td className="px-4 py-3 text-slate-300">
                {customer.email && <span className="block">{customer.email}</span>}
                {customer.phone && <span className="block text-slate-400">{customer.phone}</span>}
              </td>
              <td className="px-4 py-3 text-slate-300">{[customer.city, customer.state].filter(Boolean).join(", ") || "—"}</td>
              <td className="px-4 py-3">{customer._count.orders}</td>
              <td className="px-4 py-3">{customer._count.inquiries}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-400">{formatDate(customer.createdAt)}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
