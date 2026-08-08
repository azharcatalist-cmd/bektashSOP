"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";

/** Start (or resume) a checklist run for a template + outlet + today. */
export async function startRun(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const templateId = String(formData.get("template_id"));
  const outletId = String(formData.get("outlet_id") || profile.outlet_id || "");
  if (!outletId) throw new Error("No outlet selected");

  // resume today's run if one exists
  const { data: existing } = await supabase
    .from("checklist_runs")
    .select("id")
    .eq("template_id", templateId)
    .eq("outlet_id", outletId)
    .eq("run_date", new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()))
    .limit(1)
    .maybeSingle();

  if (existing) redirect(`/checklists/${existing.id}`);

  const { data: run, error } = await supabase
    .from("checklist_runs")
    .insert({ template_id: templateId, outlet_id: outletId, started_by: profile.id })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  redirect(`/checklists/${run.id}`);
}

/**
 * Submit a completed run: computes the score, marks it submitted,
 * and raises alerts for critical failures / low scores.
 */
export async function submitRun(runId: string) {
  const { supabase, profile } = await requireProfile();

  const { data: run } = await supabase
    .from("checklist_runs")
    .select("*, checklist_templates(name), outlets(name)")
    .eq("id", runId)
    .single();
  if (!run || run.status !== "in_progress") throw new Error("Run not open");

  const [{ data: items }, { data: responses }] = await Promise.all([
    supabase.from("checklist_items").select("*").eq("template_id", run.template_id),
    supabase.from("checklist_responses").select("*").eq("run_id", runId),
  ]);

  const all = items ?? [];
  const resp = responses ?? [];

  // every item must be answered; photo-required items must have a photo unless N/A
  for (const item of all) {
    const r = resp.find((x) => x.item_id === item.id);
    if (!r) throw new Error(`Unanswered: "${item.text}"`);
    if (item.requires_photo && r.status === "done" && !r.photo_url) {
      throw new Error(`Photo required: "${item.text}"`);
    }
  }

  const scored = resp.filter((r) => r.status !== "na");
  const done = scored.filter((r) => r.status === "done").length;
  const score = scored.length ? (done / scored.length) * 100 : 100;

  const { error } = await supabase
    .from("checklist_runs")
    .update({ status: "submitted", submitted_at: new Date().toISOString(), score })
    .eq("id", runId);
  if (error) throw new Error(error.message);

  // alerts for non-compliance
  const templateName = (run.checklist_templates as { name: string } | null)?.name ?? "Checklist";
  const outletName = (run.outlets as { name: string } | null)?.name ?? "";
  const criticalFails = all.filter((item) => {
    const r = resp.find((x) => x.item_id === item.id);
    return item.critical && r?.status === "issue";
  });

  const alerts = criticalFails.map((item) => ({
    outlet_id: run.outlet_id,
    severity: "critical" as const,
    title: `Critical failure: ${templateName}`,
    message: `${outletName}: "${item.text}" reported as an issue by ${profile.full_name}.`,
    source: "checklist",
    related_id: runId,
  }));

  if (score < 80) {
    alerts.push({
      outlet_id: run.outlet_id,
      severity: "critical",
      title: `Low checklist score: ${Math.round(score)}%`,
      message: `${outletName}: ${templateName} scored ${Math.round(score)}% (submitted by ${profile.full_name}).`,
      source: "checklist",
      related_id: runId,
    });
  }

  if (alerts.length) await supabase.from("alerts").insert(alerts);

  revalidatePath("/checklists");
  revalidatePath("/alerts");
  revalidatePath("/dashboard");
  redirect(`/checklists/${runId}`);
}
