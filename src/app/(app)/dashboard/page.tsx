import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { ROLE_LABELS, isUpper, type ChecklistTemplate, type ChecklistRun } from "@/lib/types";
import { todayIST } from "@/lib/format";
import { PageHeader, StatTile, Chip, EmptyState } from "@/components/ui";

export default async function Dashboard() {
  const { supabase, profile } = await requireProfile();
  const today = todayIST();
  const upper = isUpper(profile.role);

  const [templatesRes, runsRes, alertsRes, finesRes, modulesRes, progressRes] = await Promise.all([
    supabase.from("checklist_templates").select("*").eq("active", true),
    upper
      ? supabase.from("checklist_runs").select("*").eq("run_date", today)
      : profile.outlet_id
        ? supabase
            .from("checklist_runs")
            .select("*")
            .eq("run_date", today)
            .eq("outlet_id", profile.outlet_id)
        : Promise.resolve({ data: [] as ChecklistRun[] }),
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("resolved", false),
    supabase
      .from("violations")
      .select("id", { count: "exact", head: true })
      .in("status", ["issued", "appealed"]),
    supabase.from("training_modules").select("id").eq("active", true),
    supabase.from("training_progress").select("module_id").eq("user_id", profile.id),
  ]);

  const templates = (templatesRes.data ?? []) as ChecklistTemplate[];
  const runs = (runsRes.data ?? []) as ChecklistRun[];
  const openAlerts = alertsRes.count ?? 0;
  const pendingFines = finesRes.count ?? 0;
  const totalModules = modulesRes.data?.length ?? 0;
  const doneModules = progressRes.data?.length ?? 0;

  const daily = templates.filter((t) => t.type === "opening" || t.type === "closing");
  const dailyStatus = daily.map((t) => ({
    template: t,
    run: runs.find((r) => r.template_id === t.id),
  }));

  return (
    <>
      <PageHeader
        title={`Salam, ${profile.full_name.split(" ")[0]} 👋`}
        subtitle={`${ROLE_LABELS[profile.role]}${profile.outlets ? ` · ${profile.outlets.name}` : ""} · ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Open alerts"
          value={openAlerts}
          tone={openAlerts > 0 ? "warn" : "good"}
          hint={upper ? "across all outlets" : "at your outlet"}
        />
        <StatTile
          label="Fines pending"
          value={pendingFines}
          tone={pendingFines > 0 ? "warn" : "good"}
          hint="issued or under appeal"
        />
        <StatTile
          label="Today's checklists"
          value={`${runs.filter((r) => r.status !== "in_progress").length}/${upper ? runs.length || "—" : daily.length}`}
          hint="submitted"
        />
        <StatTile
          label="My training"
          value={totalModules ? `${Math.round((doneModules / totalModules) * 100)}%` : "—"}
          tone={doneModules >= totalModules && totalModules > 0 ? "good" : "default"}
          hint={`${doneModules}/${totalModules} modules complete`}
        />
      </div>

      {!upper && profile.outlet_id && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
            Today at {profile.outlets?.name}
          </h2>
          <div className="space-y-3">
            {dailyStatus.map(({ template, run }) => (
              <Link
                key={template.id}
                href={run ? `/checklists/${run.id}` : "/checklists"}
                className="card flex items-center justify-between hover:border-brand-yellow/50"
              >
                <div>
                  <p className="font-semibold text-zinc-100">{template.name}</p>
                  <p className="text-xs text-zinc-500">{template.description}</p>
                </div>
                {run ? (
                  run.status === "in_progress" ? (
                    <Chip tone="amber">In progress</Chip>
                  ) : (
                    <Chip tone="green">Done{run.score != null ? ` · ${Math.round(Number(run.score))}%` : ""}</Chip>
                  )
                ) : (
                  <Chip tone="gray">Not started</Chip>
                )}
              </Link>
            ))}
            {dailyStatus.length === 0 && (
              <EmptyState title="No daily checklists configured yet" />
            )}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/checklists", title: "Checklists", desc: "Opening, closing, weekly & audits", icon: "✅" },
          { href: "/sops", title: "SOPs", desc: "Step-by-step prep standards", icon: "📖" },
          { href: "/training", title: "Training", desc: "Modules & progress", icon: "🎓" },
          { href: "/onboarding", title: "Onboarding", desc: "New joiner tasks", icon: "🧭" },
          { href: "/fines", title: "Fines & appeals", desc: "Audit findings and status", icon: "⚖️" },
          { href: "/alerts", title: "Alerts", desc: "Non-compliance notifications", icon: "🚨" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="card hover:border-brand-yellow/50">
            <p className="text-2xl">{c.icon}</p>
            <p className="mt-2 font-semibold text-zinc-100">{c.title}</p>
            <p className="text-xs text-zinc-500">{c.desc}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
