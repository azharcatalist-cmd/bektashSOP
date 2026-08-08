import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { formatDate, formatDateTime } from "@/lib/format";
import { PageHeader, Chip } from "@/components/ui";
import RunForm from "./run-form";

export default async function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const { supabase } = await requireProfile();

  const { data: run } = await supabase
    .from("checklist_runs")
    .select("*, checklist_templates(name, description), outlets(name), profiles:started_by(full_name)")
    .eq("id", runId)
    .single();
  if (!run) notFound();

  const [{ data: items }, { data: responses }] = await Promise.all([
    supabase
      .from("checklist_items")
      .select("*")
      .eq("template_id", run.template_id)
      .order("position"),
    supabase.from("checklist_responses").select("*").eq("run_id", runId),
  ]);

  const template = run.checklist_templates as { name: string; description: string | null } | null;
  const outlet = run.outlets as { name: string } | null;
  const startedBy = run.profiles as { full_name: string } | null;
  const readOnly = run.status !== "in_progress";

  return (
    <>
      <PageHeader
        title={template?.name ?? "Checklist"}
        subtitle={`${outlet?.name ?? ""} · ${formatDate(run.run_date)} · started by ${startedBy?.full_name ?? "—"}`}
        action={
          readOnly ? (
            <div className="text-right">
              <Chip tone={Number(run.score) >= 80 ? "green" : "red"}>
                Submitted · {Math.round(Number(run.score ?? 0))}%
              </Chip>
              <p className="mt-1 text-xs text-zinc-500">{formatDateTime(run.submitted_at)}</p>
            </div>
          ) : (
            <Chip tone="amber">In progress</Chip>
          )
        }
      />
      <RunForm
        runId={runId}
        items={items ?? []}
        initialResponses={responses ?? []}
        readOnly={readOnly}
      />
    </>
  );
}
