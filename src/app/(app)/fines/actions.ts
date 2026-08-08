"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { FINE_ISSUER_ROLES, FINE_DECIDER_ROLES } from "@/lib/types";

export async function createFine(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (!FINE_ISSUER_ROLES.includes(profile.role)) {
    throw new Error("You are not allowed to issue fines");
  }

  const staffId = String(formData.get("staff_id") || "");
  const { data: violation, error } = await supabase
    .from("violations")
    .insert({
      outlet_id: String(formData.get("outlet_id")),
      staff_id: staffId || null,
      reported_by: profile.id,
      title: String(formData.get("title")),
      description: String(formData.get("description") || "") || null,
      cctv_ref: String(formData.get("cctv_ref") || "") || null,
      evidence_url: String(formData.get("evidence_url") || "") || null,
      fine_amount: Number(formData.get("fine_amount") || 0),
    })
    .select("id, outlet_id, title, fine_amount")
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("alerts").insert({
    outlet_id: violation.outlet_id,
    severity: "critical",
    title: `Fine issued: ${violation.title}`,
    message: `₹${violation.fine_amount} fine filed by ${profile.full_name}. Forwarded to HR. The outlet/staff member may appeal in the app.`,
    source: "audit",
    related_id: violation.id,
  });

  revalidatePath("/fines");
  revalidatePath("/alerts");
  redirect("/fines");
}

export async function appealFine(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  const id = String(formData.get("id"));
  const note = String(formData.get("appeal_note") || "").trim();
  if (!note) throw new Error("Appeal reason is required");

  const { error } = await supabase
    .from("violations")
    .update({
      status: "appealed",
      appeal_note: note,
      appealed_by: profile.id,
      appealed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "issued");
  if (error) throw new Error(error.message);
  revalidatePath("/fines");
}

export async function decideFine(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (!FINE_DECIDER_ROLES.includes(profile.role)) {
    throw new Error("Only HR / admin can decide fines");
  }
  const id = String(formData.get("id"));
  const decision = String(formData.get("decision")); // 'upheld' | 'cancelled'
  if (decision !== "upheld" && decision !== "cancelled") throw new Error("Invalid decision");

  const { error } = await supabase
    .from("violations")
    .update({
      status: decision,
      hr_note: String(formData.get("hr_note") || "") || null,
      decided_by: profile.id,
      decided_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/fines");
}

export async function markFinePaid(formData: FormData) {
  const { supabase, profile } = await requireProfile();
  if (!FINE_DECIDER_ROLES.includes(profile.role)) {
    throw new Error("Only HR / admin can mark fines as paid");
  }
  const { error } = await supabase
    .from("violations")
    .update({ status: "paid" })
    .eq("id", String(formData.get("id")))
    .eq("status", "upheld");
  if (error) throw new Error(error.message);
  revalidatePath("/fines");
}
