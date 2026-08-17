"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Anti-cheat: downscale the photo and burn a "BEKTASH OPS · date time" stamp
 * into the pixels before upload, so images can't be reused across days.
 * Falls back to the original file if canvas processing fails.
 */
async function stampAndCompress(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const maxW = 1280;
    const scale = Math.min(1, maxW / bitmap.width);
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);

    const stamp = `BEKTASH OPS · ${new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`;
    const barH = Math.max(26, Math.round(h * 0.055));
    ctx.fillStyle = "rgba(0,0,0,0.68)";
    ctx.fillRect(0, h - barH, w, barH);
    ctx.fillStyle = "#FFC60B";
    ctx.font = `bold ${Math.round(barH * 0.48)}px system-ui, sans-serif`;
    ctx.textBaseline = "middle";
    ctx.fillText(stamp, 12, h - barH / 2);

    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82)
    );
  } catch {
    return file;
  }
}

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
    const blob = await stampAndCompress(file);
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType: "image/jpeg",
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
      <p className="mt-1 text-[10px] text-zinc-600">
        Photos are time-stamped automatically — take them live, at the moment of the check.
      </p>
    </div>
  );
}
