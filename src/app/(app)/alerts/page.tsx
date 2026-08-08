import { requireProfile } from "@/lib/auth";
import { isUpper, isOutletManager } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import { PageHeader, Chip, EmptyState } from "@/components/ui";
import { resolveAlert } from "./actions";

const SEVERITY_CHIP: Record<string, { tone: string; label: string }> = {
  info: { tone: "blue", label: "Info" },
  warning: { tone: "amber", label: "Warning" },
  critical: { tone: "red", label: "Critical" },
};

export default async function AlertsPage() {
  const { supabase, profile } = await requireProfile();
  const canResolve = isUpper(profile.role) || isOutletManager(profile.role);

  const { data: alerts } = await supabase
    .from("alerts")
    .select("*, outlets(name)")
    .order("resolved", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  const open = (alerts ?? []).filter((a) => !a.resolved);
  const resolved = (alerts ?? []).filter((a) => a.resolved);

  return (
    <>
      <PageHeader
        title="Alerts"
        subtitle="Non-compliance events: critical checklist failures, low scores, and fines."
      />

      <div className="space-y-3">
        {open.map((a) => {
          const sev = SEVERITY_CHIP[a.severity] ?? SEVERITY_CHIP.warning;
          const outlet = a.outlets as { name: string } | null;
          return (
            <div key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-100">{a.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {outlet?.name ?? "All outlets"} · {formatDateTime(a.created_at)}
                  </p>
                </div>
                <Chip tone={sev.tone}>{sev.label}</Chip>
              </div>
              {a.message && <p className="mt-2 text-sm text-zinc-300">{a.message}</p>}
              {canResolve && (
                <form action={resolveAlert} className="mt-3">
                  <input type="hidden" name="id" value={a.id} />
                  <button className="btn-ghost text-xs">Mark resolved</button>
                </form>
              )}
            </div>
          );
        })}
        {open.length === 0 && (
          <EmptyState title="No open alerts" hint="All clear. Keep it that way. 🟡" />
        )}
      </div>

      {resolved.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
            Recently resolved
          </h2>
          <div className="space-y-2">
            {resolved.slice(0, 20).map((a) => (
              <div key={a.id} className="card py-3 opacity-60">
                <p className="text-sm font-semibold text-zinc-300">{a.title}</p>
                <p className="text-xs text-zinc-500">
                  {(a.outlets as { name: string } | null)?.name ?? ""} ·{" "}
                  {formatDateTime(a.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
