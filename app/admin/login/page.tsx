import { logoPath } from "@/lib/site-settings";
import { AdminLoginForm } from "./admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- the logo is swapped at runtime from Settings */}
          <img src={logoPath} alt="" width={80} height={80} className="mx-auto mb-4 h-20 w-20 rounded-full bg-white object-cover" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400">
            Mukti Miniature
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white">Admin Login</h1>
        </div>

        <AdminLoginForm />
      </div>
    </main>
  );
}
