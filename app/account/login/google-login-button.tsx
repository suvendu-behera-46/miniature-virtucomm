"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { LoaderCircle } from "lucide-react";

export function GoogleLoginButton({ ready }: { ready: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const startSignIn = async () => {
    setError("");
    setPending(true);

    try {
      const result = await signIn("google", {
        redirect: false,
        redirectTo: "/account/complete-profile",
      });

      if (result?.error) {
        setError("Google sign-in could not be completed. Please try again.");
        setPending(false);
        return;
      }

      if (result?.url) window.location.assign(result.url);
    } catch {
      setError("Google sign-in is unavailable. Check the OAuth configuration and try again.");
      setPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={startSignIn}
        disabled={!ready || pending}
        className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <span aria-hidden="true" className="font-bold text-base">G</span>}
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </button>
      {!ready && <p className="mt-3 text-sm text-amber-800">Google sign-in needs OAuth credentials in the server environment.</p>}
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
