import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Field, inputClass, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { getSiteSettings, siteSettingFields } from "@/lib/site-settings";
import { changeOwnPassword, saveSiteSettings } from "./actions";
import { SeasonalThemeEditor } from "./seasonal-theme-editor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Configuration" title="Settings" />

      <Card title="Business details" actions={<span className="text-xs text-slate-500">Shown on the contact page</span>}>
        <ActionForm action={saveSiteSettings} className="grid gap-4 md:grid-cols-2">
          {siteSettingFields.map((field) => (
            <Field key={field.key} label={field.label}>
              <input name={field.key} maxLength={500} defaultValue={settings[field.key]} className={inputClass} />
            </Field>
          ))}
          <div className="md:col-span-2"><SubmitButton>Save settings</SubmitButton></div>
        </ActionForm>
      </Card>

      <SeasonalThemeEditor />

      <Card title="Change your password">
        <ActionForm action={changeOwnPassword} resetOnSuccess className="grid gap-4 md:grid-cols-3 md:items-end">
          <Field label="Current password"><input name="currentPassword" type="password" required autoComplete="current-password" className={inputClass} /></Field>
          <Field label="New password"><input name="newPassword" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></Field>
          <Field label="Confirm new password"><input name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" className={inputClass} /></Field>
          <div><SubmitButton>Change password</SubmitButton></div>
        </ActionForm>
      </Card>
    </div>
  );
}
