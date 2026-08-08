"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Camera/photo evidence uploader. Uploads to a public Supabase storage bucket
 * and reports the public URL via onUploaded.
 */
export default function PhotoUpload({
  bucket = "evidence",
  folder,
  initialUrl,
  onUploaded,
  label = "Add photo",
}: {
  bucket?: string;
  folder: string;
  initialUrl?: string | null;
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    setUrl(data.publicUrl);
    onUploaded(data.publicUrl);
    setBusy(false);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn-ghost text-xs"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          📷 {busy ? "Uploading…" : url ? "Retake photo" : label}
        </button>
        {url && (
          <a href={url} target="_blank" rel="noreferrer">
            <img
              src={url}
              alt="evidence"
              className="h-12 w-12 rounded-lg border border-brand-line object-cover"
            />
          </a>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
