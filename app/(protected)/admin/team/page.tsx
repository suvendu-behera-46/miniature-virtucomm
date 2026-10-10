import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Badge, Card, Checkbox, Field, inputClass, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { adminRoles, requireAdmin } from "@/lib/admin-auth";
import { formatDate, humanize } from "@/lib/format";
import prisma from "@/lib/prisma";
import { createAdminUser, updateAdminUser } from "./actions";

export const dynamic = "force-dynamic";

function RoleSelect({ defaultValue = "ADMIN" }: { defaultValue?: string }) {
  return (
    <select name="role" defaultValue={defaultValue} className={inputClass}>
      {adminRoles.map((role) => <option key={role} value={role}>{humanize(role)}</option>)}
    </select>
  );
}

export default async function AdminTeamPage() {
  const me = await requireAdmin();
  if (me.role !== "SUPER_ADMIN") {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Administration" title="Team" />
        <Card><p className="text-sm text-slate-300">Only super admins can manage team members.</p></Card>
      </div>
    );
  }

  const users = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Administration" title="Team" description="People who can sign in to this admin panel. Deactivated members can no longer sign in." />

      <Card title="Add team member">
        <ActionForm action={createAdminUser} resetOnSuccess className="grid gap-4 md:grid-cols-4 md:items-end">
          <Field label="Name"><input name="name" required maxLength={120} className={inputClass} /></Field>
          <Field label="Email"><input name="email" type="email" required maxLength={254} className={inputClass} /></Field>
          <Field label="Temporary password" hint="At least 8 characters"><input name="password" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></Field>
          <Field label="Role"><RoleSelect /></Field>
          <div><SubmitButton>Add member</SubmitButton></div>
        </ActionForm>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {users.map((user) => (
          <Card key={user.id} title={user.email} actions={<div className="flex gap-2">{user.id === me.id && <Badge tone="cyan">You</Badge>}<Badge tone={user.active ? "green" : "rose"}>{user.active ? "Active" : "Deactivated"}</Badge></div>}>
            <ActionForm action={updateAdminUser} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={user.id} />
              <Field label="Name"><input name="name" required maxLength={120} defaultValue={user.name} className={inputClass} /></Field>
              <Field label="Role"><RoleSelect defaultValue={user.role} /></Field>
              <Field label="Reset password" hint="Leave blank to keep the current one"><input name="newPassword" type="password" minLength={8} autoComplete="new-password" className={inputClass} /></Field>
              <div className="flex items-end justify-between gap-3">
                <Checkbox name="active" label="Can sign in" defaultChecked={user.active} />
                <SubmitButton className={secondaryButtonClass}>Save</SubmitButton>
              </div>
              <p className="text-xs text-slate-500 sm:col-span-2">Added {formatDate(user.createdAt)}</p>
            </ActionForm>
          </Card>
        ))}
      </div>
    </div>
  );
}
