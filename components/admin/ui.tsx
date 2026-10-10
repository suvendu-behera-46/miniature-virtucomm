import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500";
export const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500 hover:text-white disabled:opacity-60";
export const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10 disabled:opacity-60";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = "" }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold text-white">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className = "" }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function Checkbox({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-cyan-500" />
      {label}
    </label>
  );
}

const badgeTones = {
  cyan: "bg-cyan-500/10 text-cyan-300",
  green: "bg-emerald-500/10 text-emerald-300",
  amber: "bg-amber-400/10 text-amber-300",
  rose: "bg-rose-500/10 text-rose-300",
  slate: "bg-slate-700/60 text-slate-300",
  violet: "bg-violet-500/10 text-violet-300",
};

export function Badge({ tone = "slate", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>{children}</span>;
}

export function statusTone(status: string): keyof typeof badgeTones {
  if (["COMPLETED", "DELIVERED", "CONVERTED", "APPROVED"].includes(status)) return "green";
  if (["CANCELLED", "CLOSED"].includes(status)) return "rose";
  if (["NEW"].includes(status)) return "amber";
  if (["SHIPPED", "READY_TO_SHIP"].includes(status)) return "violet";
  return "cyan";
}

export function EmptyState({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
      <p className="font-medium text-white">{title}</p>
      {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      {children && <div className="mt-4 flex justify-center gap-2">{children}</div>}
    </div>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/80">
      <table className="min-w-full text-left text-sm text-slate-200">
        <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            {head.map((label) => (
              <th key={label} className="whitespace-nowrap px-4 py-3 font-medium">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">{children}</tbody>
      </table>
    </div>
  );
}

export function SearchBar({ placeholder, defaultValue, children }: { placeholder: string; defaultValue?: string; children?: ReactNode }) {
  return (
    <form className="flex flex-wrap gap-2">
      <input name="q" defaultValue={defaultValue} placeholder={placeholder} className={`${inputClass} max-w-sm`} />
      {children}
      <button className={secondaryButtonClass}>Filter</button>
    </form>
  );
}
