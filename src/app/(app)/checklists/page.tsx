import { requireProfile } from "@/lib/auth";
import {
  TEMPLATE_TYPE_LABELS,
  isUpper,
  type ChecklistTemplate,
  type Outlet,
} from "@/lib/types";
import { formatDate, todayIST } from "@/lib/format";
import { PageHeader, Chip, EmptyState } from "@/components/ui";
import { startRun } from "./actions";
import Link from "next/link";

const TYPE_FOR_ROLE: Record<string, string[]> = {
  staff: ["opening", "closing", "custom"],
  shift_manager: ["opening", "closing", "custom"],
  store_manager: ["opening", "closing", "custom"],
  area_manager: ["opening", "closing", "weekly_area", "custom"],
  operations_manager: ["opening", "closing", "weekly_area", "ops_audit", "custom"],
  audit_executive: ["opening", "closing", "weekly_area", "ops_audit", "custom"],
  hr: ["custom"],
  admin: ["opening", "closing", "weekly_area", "ops_audit", "custom"],
  ceo: ["opening", "closing", "weekly_area", "ops_audit", "custom"],
};

export default async function ChecklistsPage() {
  const { supabase, profile } = await requireProfile();
  const upper = isUpper(profile.role);

  const [{ data: templates }, { data: outlets }, { data: recentRuns }] = await Promise.all([
    supabase.from("checklist_templates").select("*").eq("active", true).order("type"),
    upper ? supabase.from("outlets").select("*").eq("active", true).order("name") : Promise.resolve({ data: [] as Outlet[] }),
    supabase
      .from("checklist_runs")
      .select("*, checklist_templates(name, type), outlets(name), profiles:started_by(full_name)")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const allowedTypes = TYPE_FOR_ROLE[profile.role] ?? ["custom"];
  const startable = (templates ?? []).filter((t: ChecklistTemplate) =>
    allowedTypes.includes(t.type)
  );

  return (
    <>
      <PageHeader
        title="Checklists"
        subtitle={`Today: ${formatDate(todayIST())} — photo evidence is required where marked`}
      />

      <section className="space-y-3">
        {startable.map((t: ChecklistTemplate) => (
          <form key={t.id} action={startRun} className="card flex flex-wrap items-center gap-3">
            <input type="hidden" name="template_id" value={t.id} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-zinc-100">{t.name}</p>
                <Chip tone="yellow">{TEMPLATE_TYPE_LABELS[t.type]}</Chip>
              </div>
              {t.description && <p className="mt-0.5 text-xs text-zinc-500">{t.description}</p>}
            </div>
            {upper ? (
              <select name="outlet_id" className="input w-auto" required defaultValue="">
                <option value="" disabled>
                  Select outlet…
                </option>
                {(outlets ?? []).map((o: Outlet) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            ) : null}
            <button className="btn-primary">Start / resume</button>
          </form>
        ))}
        {startable.length === 0 && (
          <EmptyState title="No checklists available for your role yet" />
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Recent submissions
        </h2>
        <div className="space-y-2">
          {(recentRuns ?? []).map((r) => {
            const template = r.checklist_templates as { name: string } | null;
            const outlet = r.outlets as { name: string } | null;
            const by = r.profiles as { full_name: string } | null;
            return (
              <Link
                key={r.id}
                href={`/checklists/${r.id}`}
                className="card flex items-center justify-between gap-3 py-3 hover:border-brand-yellow/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-200">
                    {template?.name} · {outlet?.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatDate(r.run_date)} · by {by?.full_name ?? "—"}
                  </p>
                </div>
                {r.status === "in_progress" ? (
                  <Chip tone="amber">In progress</Chip>
                ) : (
                  <Chip tone={Number(r.score) >= 80 ? "green" : "red"}>
                    {Math.round(Number(r.score ?? 0))}%
                  </Chip>
                )}
              </Link>
            );
          })}
          {(recentRuns ?? []).length === 0 && (
            <EmptyState title="No checklist runs yet" hint="Start one above to get going." />
          )}
        </div>
      </section>
    </>
  );
}
