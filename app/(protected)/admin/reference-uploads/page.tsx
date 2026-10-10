import { Download, Image as ImageIcon } from "lucide-react";
import { listReferenceSubmissions } from "@/lib/reference-uploads";

export const dynamic = "force-dynamic";

export default async function AdminReferenceUploadsPage() {
  const submissions = await listReferenceSubmissions();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">Customer references</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Image submissions</h1>
        <p className="mt-2 text-sm text-slate-400">Review customer reference images before confirming whether a miniature can be made.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-slate-500" />
          <p className="mt-3 font-medium text-white">No image submissions yet</p>
          <p className="mt-1 text-sm text-slate-400">Customer uploads will appear here for your team to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <article key={submission.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{submission.name}</h2>
                  <a className="mt-1 block text-sm text-cyan-300 hover:text-cyan-200" href={`mailto:${submission.email}`}>
                    {submission.email}
                  </a>
                  {submission.phone && (
                    <a className="mt-1 block text-sm text-cyan-300 hover:text-cyan-200" href={`tel:${submission.phone}`}>
                      {submission.phone}
                    </a>
                  )}
                  <p className="mt-1 text-xs text-slate-500">{new Date(submission.createdAt).toLocaleString()}</p>
                </div>
                <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">Pending review</span>
              </div>

              {submission.description && <p className="mt-4 whitespace-pre-wrap text-sm text-slate-300">{submission.description}</p>}

              <ul className="mt-4 flex flex-wrap gap-2">
                {submission.files.map((file) => (
                  <li key={file.id}>
                    <a
                      href={`/api/admin/reference-uploads/${submission.id}/${file.id}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-500"
                    >
                      <Download className="h-4 w-4 text-cyan-400" />
                      <span className="max-w-52 truncate">{file.originalName}</span>
                      <span className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
