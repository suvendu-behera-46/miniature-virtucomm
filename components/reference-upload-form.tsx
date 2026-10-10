"use client";

import { useEffect, useState, type FormEvent, type InputHTMLAttributes } from "react";
import { CheckCircle2, LoaderCircle, Upload } from "lucide-react";
import { maxReferenceFiles as maxFiles, maxReferenceFileSize as maxFileSize, maxReferenceTotalSize as maxTotalSize } from "@/lib/reference-upload-limits";

const toMegabytes = (bytes: number) => Math.round(bytes / (1024 * 1024));
const inputClassName = "min-h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50";
const secondaryButtonClassName = "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-700 px-4 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50";

export function ReferenceUploadForm() {
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <ReferenceUploadFormFields
        key={formKey}
        onSubmitted={() => {
          setFormKey((key) => key + 1);
          setSubmitted(true);
        }}
        onEdit={() => setSubmitted(false)}
      />
      {submitted && (
        <p role="status" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Reference received. Our team will review it and get back to you.
        </p>
      )}
    </div>
  );
}

function ReferenceUploadFormFields({ onSubmitted, onEdit }: { onSubmitted: () => void; onEdit: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [emailToken, setEmailToken] = useState("");
  const [phoneToken, setPhoneToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!emailToken || !phoneToken) {
      setError("Verify your email address and phone number before submitting.");
      return;
    }
    if (!files.length) {
      setError("Choose at least one reference image to upload.");
      return;
    }
    if (
      files.length > maxFiles ||
      files.some((file) => file.size > maxFileSize) ||
      files.reduce((total, file) => total + file.size, 0) > maxTotalSize
    ) {
      setError(`Upload up to ${maxFiles} images, no larger than ${toMegabytes(maxFileSize)} MB each or ${toMegabytes(maxTotalSize)} MB combined.`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reference-uploads", {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Your images could not be uploaded.");

      onSubmitted();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Your images could not be uploaded.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} onChange={onEdit} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8 md:grid-cols-2">
      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Your name</span>
          <input name="name" required minLength={2} maxLength={100} autoComplete="name" className={inputClassName} />
        </label>
        <VerifiedInput
          channel="email"
          label="Email address"
          onVerifiedChange={setEmailToken}
          inputProps={{ type: "email", maxLength: 254, autoComplete: "email" }}
        />
        <VerifiedInput
          channel="phone"
          label="Phone number"
          hint="Include your country code, e.g. +91 98765 43210."
          onVerifiedChange={setPhoneToken}
          inputProps={{ type: "tel", maxLength: 20, autoComplete: "tel", placeholder: "+91 98765 43210" }}
        />
        <input type="hidden" name="emailToken" value={emailToken} />
        <input type="hidden" name="phoneToken" value={phoneToken} />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">What would you like made? <span className="font-normal text-slate-500">(optional)</span></span>
          <textarea name="description" rows={4} maxLength={2000} placeholder="Tell us about the miniature you have in mind." className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />
        </label>
      </div>

      <div className="flex flex-col">
        <label htmlFor="reference-files" className="flex min-h-52 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-cyan-200 bg-cyan-50/70 p-6 text-center transition hover:border-cyan-500 hover:bg-cyan-50">
          <span className="mb-3 rounded-2xl bg-white p-3 text-cyan-700 shadow-sm"><Upload className="h-6 w-6" /></span>
          <span className="font-semibold text-slate-900">Choose your reference images</span>
          <span className="mt-2 text-sm text-slate-600">JPG, PNG, or WebP · up to {maxFiles} images · {toMegabytes(maxFileSize)} MB each, {toMegabytes(maxTotalSize)} MB total</span>
          <input
            id="reference-files"
            name="files"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            onChange={(event) => {
              setFiles(Array.from(event.currentTarget.files ?? []));
              setError("");
            }}
            className="sr-only"
          />
        </label>
        <p className="mt-3 min-h-5 text-sm text-slate-600" aria-live="polite">
          {files.length ? files.map((file) => file.name).join(", ") : "Your images are sent privately to our team for review."}
        </p>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-700">{error}</p>}
        {(!emailToken || !phoneToken) && !error && (
          <p className="mt-2 text-sm text-slate-500">Verify your email and phone number to submit.</p>
        )}
        <button type="submit" disabled={submitting || !emailToken || !phoneToken} className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {submitting ? "Sending…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}

type VerifiedInputProps = {
  channel: "email" | "phone";
  label: string;
  hint?: string;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  onVerifiedChange: (token: string) => void;
};

function VerifiedInput({ channel, label, hint, inputProps, onVerifiedChange }: VerifiedInputProps) {
  const [value, setValue] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState<"send" | "check" | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const reset = () => {
    setChallenge("");
    setCode("");
    setVerified(false);
    setMessage("");
    setError("");
    onVerifiedChange("");
  };

  const sendCode = async () => {
    setError("");
    setMessage("");
    setBusy("send");
    try {
      const result = await postJson<{ target: string; challenge: string }>("/api/verification/send", { channel, target: value });
      setValue(result.target);
      setChallenge(result.challenge);
      setCode("");
      setCooldown(60);
      setMessage(channel === "email" ? `We emailed a 6-digit code to ${result.target}.` : `We sent a code by SMS to ${result.target}.`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "We could not send a code.");
    } finally {
      setBusy(null);
    }
  };

  const checkCode = async () => {
    setError("");
    setBusy("check");
    try {
      const result = await postJson<{ target: string; token: string }>("/api/verification/check", { challenge, code });
      setVerified(true);
      setMessage("");
      onVerifiedChange(result.token);
    } catch (checkError) {
      setError(checkError instanceof Error ? checkError.message : "We could not check that code.");
    } finally {
      setBusy(null);
    }
  };

  const inputId = `reference-${channel}`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        {verified && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Verified</span>}
      </label>
      <div className="flex gap-2">
        <input
          {...inputProps}
          id={inputId}
          name={channel}
          required
          value={value}
          onChange={(event) => {
            setValue(event.currentTarget.value);
            if (challenge || verified) reset();
          }}
          className={`${inputClassName} ${verified ? "border-emerald-400" : ""}`}
        />
        {!verified && (
          <button type="button" onClick={sendCode} disabled={!value.trim() || busy !== null || cooldown > 0} className={secondaryButtonClassName}>
            {busy === "send" && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {cooldown > 0 ? `Resend in ${cooldown}s` : challenge ? "Resend code" : "Send code"}
          </button>
        )}
      </div>
      {hint && !challenge && !verified && <p className="mt-1 text-xs text-slate-500">{hint}</p>}

      {challenge && !verified && (
        <div className="mt-2 flex gap-2">
          <input
            aria-label={`${label} verification code`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={10}
            placeholder="Enter code"
            value={code}
            onChange={(event) => setCode(event.currentTarget.value.replace(/\D/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (code.length >= 4 && busy === null) void checkCode();
              }
            }}
            className={`${inputClassName} tracking-[0.3em]`}
          />
          <button type="button" onClick={checkCode} disabled={code.length < 4 || busy !== null} className={secondaryButtonClassName}>
            {busy === "check" && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Verify
          </button>
        </div>
      )}

      {message && <p className="mt-1 text-xs text-slate-600" aria-live="polite">{message}</p>}
      {error && <p role="alert" className="mt-1 text-xs font-medium text-rose-700">{error}</p>}
    </div>
  );
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}
