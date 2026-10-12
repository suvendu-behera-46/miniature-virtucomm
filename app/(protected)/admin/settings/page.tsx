import { ActionButton, ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Card, Field, inputClass, PageHeader, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin-auth";
import { defaultLogoUrl, getLogoUrl, getSiteSettings, siteSettingFields } from "@/lib/site-settings";
import { changeOwnPassword, resetLogo, saveLogo, saveSiteSettings } from "./actions";
import { SeasonalThemeEditor } from "./seasonal-theme-editor";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const [settings, logoUrl] = await Promise.all([getSiteSettings(), getLogoUrl()]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Configuration" title="Settings" />

      <Card title="Logo" actions={<span className="text-xs text-slate-500">Used in the site header, footer, admin panel, and browser tab</span>}>
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploaded images are served from /media, not optimized */}
          <img src={logoUrl} alt="Current logo" className="h-28 w-28 shrink-0 rounded-full bg-white object-cover" />
          <div className="flex-1 space-y-3">
            <ActionForm action={saveLogo} resetOnSuccess className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Upload a new logo" hint="Square JPG, PNG, or WebP works best (under 1 MB)." className="flex-1">
                <input name="logo" type="file" required accept="image/jpeg,image/png,image/webp" className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-1 file:text-slate-200`} />
              </Field>
              <div><SubmitButton>Save logo</SubmitButton></div>
            </ActionForm>
            {logoUrl !== defaultLogoUrl && (
              <ActionButton action={resetLogo} fields={{}} confirmMessage="Go back to the default logo?" className={secondaryButtonClass}>
                Reset to default logo
              </ActionButton>
            )}
          </div>
        </div>
      </Card>

      <Card title="Business details" actions={<span className="text-xs text-slate-500">Shown in the site footer and on the contact page</span>}>
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
