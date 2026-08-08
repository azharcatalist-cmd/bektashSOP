import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { isUpper, isOutletManager, type Outlet } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { PageHeader, StatTile, Bar, EmptyState } from "@/components/ui";

export default async function ReportsPage() {
  const { supabase, profile } = await requireProfile();
  if (!isUpper(profile.role) && !isOutletManager(profile.role)) redirect("/dashboard");

  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const sinceDate = since.slice(0, 10);

  const [outletsRes, runsRes, finesRes, alertsRes, profilesRes, modulesRes, progressRes] =
    await Promise.all([
      supabase.from("outlets").select("*").eq("active", true).order("name"),
      supabase
        .from("checklist_runs")
        .select("id, outlet_id, status, score, run_date, checklist_templates(type)")
        .gte("run_date", sinceDate),
      supabase.from("violations").select("id, outlet_id, status, fine_amount, created_at"),
      supabase.from("alerts").select("id, outlet_id, resolved, severity, created_at"),
      supabase.from("profiles").select("id, outlet_id, active").eq("active", true),
      supabase.from("training_modules").select("id").eq("active", true),
      supabase.from("training_progress").select("user_id, module_id"),
    ]);

  const outlets = (outletsRes.data ?? []) as Outlet[];
  const runs = runsRes.data ?? [];
  const fines = finesRes.data ?? [];
  const alerts = alertsRes.data ?? [];
  const people = profilesRes.data ?? [];
  const moduleCount = (modulesRes.data ?? []).length;
  const progress = progressRes.data ?? [];

  const submitted = runs.filter((r) => r.status !== "in_progress");
  const avgScore = submitted.length
    ? submitted.reduce((s, r) => s + Number(r.score ?? 0), 0) / submitted.length
    : 0;
  const openAlerts = alerts.filter((a) => !a.resolved);
  const finesLast30 = fines.filter((f) => f.created_at >= since);
  const finesIssuedAmt = finesLast30
    .filter((f) => f.status !== "cancelled")
    .reduce((s, f) => s + Number(f.fine_amount), 0);
  const pendingAppeals = fines.filter((f) => f.status === "appealed").length;
  const trainingPct =
    people.length && moduleCount
      ? (progress.length / (people.length * moduleCount)) * 100
      : 0;

  const perOutlet = outlets.map((o) => {
    const oRuns = submitted.filter((r) => r.outlet_id === o.id);
    const oScore = oRuns.length
      ? oRuns.reduce((s, r) => s + Number(r.score ?? 0), 0) / oRuns.length
      : null;
    const oFines = finesLast30.filter((f) => f.outlet_id === o.id && f.status !== "cancelled");
    const oAlerts = openAlerts.filter((a) => a.outlet_id === o.id);
    return {
      outlet: o,
      runs: oRuns.length,
      score: oScore,
      finesAmt: oFines.reduce((s, f) => s + Number(f.fine_amount), 0),
      finesCount: oFines.length,
      openAlerts: oAlerts.length,
    };
  });

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Last 30 days across the business — checklist compliance, audit fines, alerts and training."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Checklists submitted" value={submitted.length} hint="last 30 days" />
        <StatTile
          label="Avg checklist score"
          value={submitted.length ? `${Math.round(avgScore)}%` : "—"}
          tone={avgScore >= 90 ? "good" : avgScore >= 80 ? "warn" : "bad"}
        />
        <StatTile
          label="Open alerts"
          value={openAlerts.length}
          tone={openAlerts.length ? "warn" : "good"}
        />
        <StatTile
          label="Fines issued"
          value={formatINR(finesIssuedAmt)}
          hint={`${finesLast30.length} filed, last 30 days`}
          tone={finesIssuedAmt > 0 ? "warn" : "good"}
        />
        <StatTile
          label="Appeals pending"
          value={pendingAppeals}
          tone={pendingAppeals ? "warn" : "good"}
          hint="awaiting HR decision"
        />
        <StatTile
          label="Training completion"
          value={`${Math.round(trainingPct)}%`}
          hint="all staff, all modules"
          tone={trainingPct >= 80 ? "good" : "warn"}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Checklist compliance score by outlet
        </h2>
        <div className="card space-y-4">
          {perOutlet.map(({ outlet, score }) => (
            <div key={outlet.id}>
              <p className="mb-1 text-sm font-semibold text-zinc-200">{outlet.name}</p>
              {score == null ? (
                <p className="text-xs text-zinc-500">No submissions in the last 30 days</p>
              ) : (
                <Bar pct={score} />
              )}
            </div>
          ))}
          {perOutlet.length === 0 && <EmptyState title="No outlets configured" />}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-400">
          Outlet scorecard (last 30 days)
        </h2>
        <div className="card overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-brand-line text-left text-xs uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Outlet</th>
                <th className="px-4 py-3 text-right">Checklists</th>
                <th className="px-4 py-3 text-right">Avg score</th>
                <th className="px-4 py-3 text-right">Fines</th>
                <th className="px-4 py-3 text-right">Fine amount</th>
                <th className="px-4 py-3 text-right">Open alerts</th>
              </tr>
            </thead>
            <tbody>
              {perOutlet.map((row) => (
                <tr key={row.outlet.id} className="border-b border-brand-line/50">
                  <td className="px-4 py-3 font-semibold text-zinc-200">{row.outlet.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">{row.runs}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                    {row.score == null ? "—" : `${Math.round(row.score)}%`}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                    {row.finesCount}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                    {formatINR(row.finesAmt)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-zinc-300">
                    {row.openAlerts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
