"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem, ChecklistResponse } from "@/lib/types";
import PhotoUpload from "@/components/photo-upload";
import { submitRun } from "../actions";

type Draft = { status: "done" | "issue" | "na" | null; note: string; photo_url: string | null };

const STATUS_BUTTONS: { value: "done" | "issue" | "na"; label: string; activeCls: string }[] = [
  { value: "done", label: "✓ Done", activeCls: "bg-emerald-500 text-white" },
  { value: "issue", label: "✗ Issue", activeCls: "bg-red-500 text-white" },
  { value: "na", label: "N/A", activeCls: "bg-zinc-500 text-white" },
];

export default function RunForm({
  runId,
  items,
  initialResponses,
  readOnly,
}: {
  runId: string;
  items: ChecklistItem[];
  initialResponses: ChecklistResponse[];
  readOnly: boolean;
}) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => {
    const d: Record<string, Draft> = {};
    for (const item of items) {
      const r = initialResponses.find((x) => x.item_id === item.id);
      d[item.id] = {
        status: r?.status ?? null,
        note: r?.note ?? "",
        photo_url: r?.photo_url ?? null,
      };
    }
    return d;
  });
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function save(itemId: string, patch: Partial<Draft>) {
    const next = { ...drafts[itemId], ...patch };
    setDrafts((d) => ({ ...d, [itemId]: next }));
    if (!next.status) return; // nothing to persist until a status is chosen
    setSaving(itemId);
    const supabase = createClient();
    const { error: err } = await supabase.from("checklist_responses").upsert(
      {
        run_id: runId,
        item_id: itemId,
        status: next.status,
        note: next.note || null,
        photo_url: next.photo_url,
      },
      { onConflict: "run_id,item_id" }
    );
    if (err) setError(err.message);
    setSaving(null);
  }

  const answered = items.filter((i) => drafts[i.id]?.status).length;
  const missingPhotos = items.filter(
    (i) => i.requires_photo && drafts[i.id]?.status === "done" && !drafts[i.id]?.photo_url
  );
  const canSubmit = answered === items.length && missingPhotos.length === 0 && !readOnly;

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="card sticky top-14 z-10 flex items-center justify-between py-3 md:top-0">
          <p className="text-sm font-semibold text-zinc-300">
            {answered}/{items.length} answered
            {missingPhotos.length > 0 && (
              <span className="ml-2 text-xs text-amber-400">
                {missingPhotos.length} photo{missingPhotos.length > 1 ? "s" : ""} missing
              </span>
            )}
          </p>
          <button
            className="btn-primary"
            disabled={!canSubmit || pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                try {
                  await submitRun(runId);
                } catch (e) {
                  // Next redirect() throws internally - only surface real errors
                  const msg = e instanceof Error ? e.message : String(e);
                  if (!msg.includes("NEXT_REDIRECT")) setError(msg);
                }
              })
            }
          >
            {pending ? "Submitting…" : "Submit checklist"}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {items.map((item, idx) => {
        const d = drafts[item.id];
        return (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-zinc-100">
                <span className="mr-2 text-zinc-500">{idx + 1}.</span>
                {item.text}
              </p>
              <div className="flex shrink-0 gap-1.5">
                {item.critical && <span title="Critical item">🔴</span>}
                {item.requires_photo && <span title="Photo required">📷</span>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {STATUS_BUTTONS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  disabled={readOnly || saving === item.id}
                  onClick={() => save(item.id, { status: b.value })}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    d?.status === b.value
                      ? b.activeCls
                      : "bg-brand-surface text-zinc-400 hover:text-zinc-200"
                  } ${readOnly ? "pointer-events-none opacity-70" : ""}`}
                >
                  {b.label}
                </button>
              ))}
              {saving === item.id && <span className="text-xs text-zinc-500">saving…</span>}
            </div>

            {(d?.status === "issue" || d?.note) && (
              <textarea
                className="input mt-3"
                rows={2}
                placeholder={d?.status === "issue" ? "Describe the issue (required)…" : "Note…"}
                value={d?.note ?? ""}
                disabled={readOnly}
                onChange={(e) =>
                  setDrafts((prev) => ({
                    ...prev,
                    [item.id]: { ...prev[item.id], note: e.target.value },
                  }))
                }
                onBlur={(e) => save(item.id, { note: e.target.value })}
              />
            )}

            {item.requires_photo && d?.status !== "na" && (
              <div className="mt-3">
                {readOnly ? (
                  d?.photo_url ? (
                    <a href={d.photo_url} target="_blank" rel="noreferrer">
                      <img
                        src={d.photo_url}
                        alt="evidence"
                        className="h-20 w-20 rounded-lg border border-brand-line object-cover"
                      />
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500">No photo</p>
                  )
                ) : (
                  <PhotoUpload
                    folder={`checklists/${runId}`}
                    initialUrl={d?.photo_url}
                    onUploaded={(url) => save(item.id, { photo_url: url })}
                    label="Photo evidence"
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
