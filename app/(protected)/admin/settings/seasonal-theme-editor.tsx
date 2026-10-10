"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, LoaderCircle, Save, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import type { SeasonalTheme } from "@/lib/seasonal-theme";

const initialTheme: SeasonalTheme = {
  enabled: false,
  title: "",
  subtitle: "",
  startsAt: "",
  endsAt: "",
  accentColor: "#0e7490",
  overlayOpacity: 55,
  images: [],
};

export function SeasonalThemeEditor() {
  const [theme, setTheme] = useState<SeasonalTheme>(initialTheme);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let current = true;
    fetch("/api/admin/site-theme")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Theme settings could not be loaded.");
        if (current) setTheme({ ...initialTheme, ...result });
      })
      .catch((loadError: unknown) => {
        if (current) setError(loadError instanceof Error ? loadError.message : "Theme settings could not be loaded.");
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, []);

  const updateTheme = <Key extends keyof SeasonalTheme>(key: Key, value: SeasonalTheme[Key]) => {
    setTheme((current) => ({ ...current, [key]: value }));
  };

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    setNotice("");
    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("files", file));
      const response = await fetch("/api/admin/site-theme/upload", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setTheme((current) => ({ ...current, images: [...current.images, ...result.uploads] }));
      setNotice(`${result.uploads.length} image${result.uploads.length === 1 ? "" : "s"} added. Save the theme to publish changes.`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const saveTheme = async () => {
    setError("");
    setNotice("");
    setSaving(true);

    const payload: SeasonalTheme = {
      ...theme,
      startsAt: theme.startsAt ? new Date(theme.startsAt).toISOString() : "",
      endsAt: theme.endsAt ? new Date(theme.endsAt).toISOString() : "",
    };

    try {
      const response = await fetch("/api/admin/site-theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Theme could not be saved.");
      setTheme({ ...initialTheme, ...result.theme });
      setNotice("Seasonal theme saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Theme could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const removeImage = (index: number) => {
    setTheme((current) => ({ ...current, images: current.images.filter((_, imageIndex) => imageIndex !== index) }));
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-5 py-5 sm:px-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">Storefront appearance</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Seasonal theme</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">Schedule an occasion banner using your own photos or animated GIFs.</p>
        </div>
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm font-medium text-slate-200">
          <input
            type="checkbox"
            checked={theme.enabled}
            onChange={(event) => updateTheme("enabled", event.target.checked)}
            className="h-4 w-4 accent-cyan-500"
            disabled={loading}
          />
          Theme enabled
        </label>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <div className="space-y-5">
          <Field label="Occasion name" value={theme.title} onChange={(value) => updateTheme("title", value)} placeholder="Independence Day" disabled={loading} />
          <Field label="Short message" value={theme.subtitle} onChange={(value) => updateTheme("subtitle", value)} placeholder="Celebrate the spirit of freedom" disabled={loading} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts at" type="datetime-local" value={toLocalInput(theme.startsAt)} onChange={(value) => updateTheme("startsAt", value)} disabled={loading} />
            <Field label="Ends at" type="datetime-local" value={toLocalInput(theme.endsAt)} onChange={(value) => updateTheme("endsAt", value)} disabled={loading} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-300">Accent color</span>
              <span className="flex h-11 items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3">
                <input type="color" value={theme.accentColor} onChange={(event) => updateTheme("accentColor", event.target.value)} aria-label="Theme accent color" className="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0" />
                <span className="text-sm text-slate-300">{theme.accentColor.toUpperCase()}</span>
              </span>
            </label>
            <label className="block">
              <span className="mb-2 flex items-center justify-between text-sm font-medium text-slate-300"><span>Image overlay</span><span>{theme.overlayOpacity}%</span></span>
              <input type="range" min="0" max="90" step="5" value={theme.overlayOpacity} onChange={(event) => updateTheme("overlayOpacity", Number(event.target.value))} className="mt-3 w-full accent-cyan-500" aria-label="Image overlay strength" />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button type="button" onClick={() => fileInput.current?.click()} disabled={loading || uploading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm font-semibold text-slate-200 transition hover:border-cyan-600 disabled:opacity-50">
              {uploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading…" : "Add photos or GIFs"}
            </button>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={(event) => void uploadImages(event.target.files)} className="sr-only" aria-label="Choose theme images or GIFs" />
            <span className="text-xs text-slate-500">JPEG, PNG, WebP, GIF · 12 MB each · up to 8 per upload</span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">Background images</h3>
            <span className="text-xs text-slate-500">{theme.images.length} added</span>
          </div>
          {theme.images.length === 0 ? (
            <button type="button" onClick={() => fileInput.current?.click()} className="flex min-h-44 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 text-sm text-slate-400 transition hover:border-cyan-600 hover:text-slate-200">
              <ImagePlus className="h-7 w-7" />
              Choose occasion photos or GIFs
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {theme.images.map((image, index) => (
                <div key={`${image.src}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
                  <Image src={image.src} alt={image.alt} fill unoptimized sizes="(max-width: 640px) 50vw, 240px" className="object-cover" />
                  <button type="button" onClick={() => removeImage(index)} aria-label={`Remove ${image.alt}`} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-slate-950/85 text-white opacity-100 transition hover:bg-rose-700 sm:opacity-0 sm:group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-slate-950/80 px-2 py-1 text-[10px] text-slate-200">{image.alt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div aria-live="polite" className="text-sm">
          {error ? <p className="text-rose-300">{error}</p> : notice ? <p className="text-emerald-300">{notice}</p> : <p className="text-slate-500">{loading ? "Loading saved theme…" : "Changes are not public until saved."}</p>}
        </div>
        <button type="button" onClick={() => void saveTheme()} disabled={loading || saving || uploading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-wait disabled:opacity-50">
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save seasonal theme"}
        </button>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} className="min-h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500 disabled:opacity-50" />
    </label>
  );
}

function toLocalInput(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
