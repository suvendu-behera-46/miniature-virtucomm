import { SeasonalThemeEditor } from "./seasonal-theme-editor";

const settings = [
  { label: "Business name", value: "Miniature Studio" },
  { label: "WhatsApp", value: "+91 98765 43210" },
  { label: "Email", value: "hello@miniaturestudio.in" },
  { label: "Currency", value: "INR" },
  { label: "Default shipping", value: "₹299" },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Configuration</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Settings</h1>
      </div>

      <SeasonalThemeEditor />

      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
