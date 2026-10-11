"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, ImagePlus, LoaderCircle, Mail, MessageCircle, Upload, X } from "lucide-react";
import { maxReferenceFiles as maxFiles, maxReferenceFileSize as maxFileSize, maxReferenceTotalSize as maxTotalSize } from "@/lib/reference-upload-limits";

const toMegabytes = (bytes: number) => Math.round(bytes / (1024 * 1024));
const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const fileKey = (file: File) => `${file.name}:${file.size}:${file.lastModified}`;
const inputClassName = "min-h-12 w-full rounded-xl border border-slate-300 px-4 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50";
const secondaryButtonClassName = "inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-700 px-4 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50";

export function ReferenceUploadForm({ whatsappUrl }: { whatsappUrl: string | null }) {
  const [mode, setMode] = useState<"choose" | "email">("choose");
  const [formKey, setFormKey] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {mode === "choose" ? (
        <motion.div
          key="choose"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2"
        >
          {whatsappUrl && (
            <ContactOption
              href={whatsappUrl}
              index={0}
              icon={<MessageCircle className="h-7 w-7" />}
              title="Chat on WhatsApp"
              text="Send your photo straight to our team on WhatsApp and get a quick reply."
              action="Open WhatsApp"
              tone="green"
            />
          )}
          <ContactOption
            onClick={() => {
              setSubmitted(false);
              setMode("email");
            }}
            index={1}
            icon={<Mail className="h-7 w-7" />}
            title="Share by email"
            text="Upload up to 5 images with a few details. We'll review them and reply by email."
            action="Upload images"
            tone="cyan"
          />
          {submitted && (
            <p role="status" className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700 md:col-span-2">
              <CheckCircle2 className="h-4 w-4" /> Reference received. Our team will review it and get back to you.
            </p>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="email"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <button type="button" onClick={() => setMode("choose")} className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-800 hover:text-cyan-600">
            <ArrowLeft className="h-4 w-4" /> Choose another way
          </button>
          <ReferenceUploadFormFields
            key={formKey}
            onSubmitted={() => {
              setFormKey((key) => key + 1);
              setSubmitted(true);
              setMode("choose");
            }}
            onEdit={() => setSubmitted(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const optionTones = {
  green: { card: "hover:border-green-500 hover:shadow-green-100", icon: "bg-green-600 text-white", action: "text-green-700" },
  cyan: { card: "hover:border-cyan-600 hover:shadow-cyan-100", icon: "bg-cyan-700 text-white", action: "text-cyan-800" },
};

function ContactOption({
  href,
  onClick,
  index,
  icon,
  title,
  text,
  action,
  tone,
}: {
  href?: string;
  onClick?: () => void;
  index: number;
  icon: ReactNode;
  title: string;
  text: string;
  action: string;
  tone: keyof typeof optionTones;
}) {
  const colors = optionTones[tone];
  const className = `group flex h-full flex-col items-start rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition-shadow hover:shadow-xl ${colors.card}`;
  const content = (
    <>
      <span className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl shadow-md transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${colors.icon}`}>{icon}</span>
      <span className="text-xl font-bold text-slate-900">{title}</span>
      <span className="mt-2 text-slate-600">{text}</span>
      <span className={`mt-6 inline-flex items-center gap-2 font-semibold ${colors.action}`}>
        {action} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{content}</a>
      ) : (
        <button type="button" onClick={onClick} className={className}>{content}</button>
      )}
    </motion.div>
  );
}

function ReferenceUploadFormFields({ onSubmitted, onEdit }: { onSubmitted: () => void; onEdit: () => void }) {
  // Each preview URL is created when the image is added and revoked when it is removed or sent.
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const files = previews.map((preview) => preview.file);
  const totalSize = files.reduce((total, file) => total + file.size, 0);

  // Adds to the current selection instead of replacing it, skipping duplicates.
  const addFiles = (incoming: File[]) => {
    const problems: string[] = [];
    const added: { file: File; url: string }[] = [];
    for (const file of incoming) {
      if (!acceptedTypes.includes(file.type)) problems.push(`${file.name} is not a JPG, PNG, or WebP image.`);
      else if (file.size > maxFileSize) problems.push(`${file.name} is larger than ${toMegabytes(maxFileSize)} MB.`);
      else if ([...files, ...added.map((item) => item.file)].some((existing) => fileKey(existing) === fileKey(file))) continue;
      else if (files.length + added.length >= maxFiles) {
        problems.push(`You can add up to ${maxFiles} images.`);
        break;
      } else added.push({ file, url: URL.createObjectURL(file) });
    }
    setPreviews((current) => [...current, ...added]);
    setError(problems.join(" "));
    onEdit();
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    setPreviews((current) => current.filter((_, position) => position !== index));
    setError("");
  };
  const [emailToken, setEmailToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!emailToken) {
      setError("Verify your email address before submitting.");
      return;
    }
    if (!files.length) {
      setError("Choose at least one reference image to upload.");
      return;
    }
    if (files.length > maxFiles || files.some((file) => file.size > maxFileSize) || totalSize > maxTotalSize) {
      setError(`Upload up to ${maxFiles} images, no larger than ${toMegabytes(maxFileSize)} MB each or ${toMegabytes(maxTotalSize)} MB combined.`);
      return;
    }

    const formData = new FormData(event.currentTarget);
    formData.delete("files");
    for (const file of files) formData.append("files", file, file.name);

    setSubmitting(true);
    try {
      const response = await fetch("/api/reference-uploads", {
        method: "POST",
        body: formData,
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Your images could not be uploaded.");

      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
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
        <VerifiedEmailInput onVerifiedChange={setEmailToken} />
        <input type="hidden" name="emailToken" value={emailToken} />
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">What would you like made? <span className="font-normal text-slate-500">(optional)</span></span>
          <textarea name="description" rows={4} maxLength={2000} placeholder="Tell us about the miniature you have in mind." className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100" />
        </label>
      </div>

      <div className="flex flex-col">
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            addFiles(Array.from(event.dataTransfer.files));
          }}
          className={`flex min-h-52 flex-1 flex-col rounded-2xl border-2 border-dashed p-4 transition ${dragging ? "border-cyan-500 bg-cyan-50" : "border-cyan-200 bg-cyan-50/70"}`}
        >
          {files.length === 0 ? (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-1 flex-col items-center justify-center p-2 text-center">
              <span className="mb-3 rounded-2xl bg-white p-3 text-cyan-700 shadow-sm"><Upload className="h-6 w-6" /></span>
              <span className="font-semibold text-slate-900">Choose or drag your reference images</span>
              <span className="mt-2 text-sm text-slate-600">JPG, PNG, or WebP · up to {maxFiles} images · {toMegabytes(maxFileSize)} MB each, {toMegabytes(maxTotalSize)} MB total</span>
            </button>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map(({ file, url }, index) => (
                  <li key={fileKey(file)} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                    <img src={url} alt={`Preview of ${file.name}`} className="aspect-square w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name}`}
                      className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-slate-900/70 text-white transition hover:bg-rose-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="truncate px-2 py-1 text-xs text-slate-600" title={file.name}>{file.name} · {formatSize(file.size)}</p>
                  </li>
                ))}
                {files.length < maxFiles && (
                  <li>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-cyan-300 bg-white/70 text-sm font-medium text-cyan-800 transition hover:border-cyan-500 hover:bg-white"
                    >
                      <ImagePlus className="h-6 w-6" />
                      Add more
                    </button>
                  </li>
                )}
              </ul>
              <p className={`mt-3 text-xs ${totalSize > maxTotalSize ? "font-medium text-rose-700" : "text-slate-600"}`}>
                {files.length} of {maxFiles} images · {formatSize(totalSize)} of {toMegabytes(maxTotalSize)} MB
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            id="reference-files"
            type="file"
            accept={acceptedTypes.join(",")}
            multiple
            onChange={(event) => {
              addFiles(Array.from(event.currentTarget.files ?? []));
              // Clear the input so picking the same file again still triggers onChange.
              event.currentTarget.value = "";
            }}
            className="sr-only"
          />
        </div>
        <p className="mt-3 text-sm text-slate-600">Your images are sent privately to our team for review.</p>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-700">{error}</p>}
        {!emailToken && !error && (
          <p className="mt-2 text-sm text-slate-500">Verify your email address to submit.</p>
        )}
        <button type="submit" disabled={submitting || !emailToken} className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-700 px-6 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {submitting ? "Sending…" : "Submit for review"}
        </button>
      </div>
    </form>
  );
}

function VerifiedEmailInput({ onVerifiedChange }: { onVerifiedChange: (token: string) => void }) {
  const label = "Email address";
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
      const result = await postJson<{ target: string; challenge: string }>("/api/verification/send", { email: value });
      setValue(result.target);
      setChallenge(result.challenge);
      setCode("");
      setCooldown(60);
      setMessage(`We emailed a 6-digit code to ${result.target}.`);
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

  const inputId = "reference-email";

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
        {label}
        {verified && <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Verified</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="email"
          maxLength={254}
          autoComplete="email"
          id={inputId}
          name="email"
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

      {challenge && !verified && (
        <div className="mt-2 flex gap-2">
          <input
            aria-label={`${label} verification code`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter code"
            value={code}
            onChange={(event) => setCode(event.currentTarget.value.replace(/\D/g, ""))}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (code.length === 6 && busy === null) void checkCode();
              }
            }}
            className={`${inputClassName} tracking-[0.3em]`}
          />
          <button type="button" onClick={checkCode} disabled={code.length !== 6 || busy !== null} className={secondaryButtonClassName}>
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
