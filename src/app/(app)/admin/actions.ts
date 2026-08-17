"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { isAdminLevel } from "@/lib/types";

async function requireAdmin() {
  const ctx = await requireProfile();
  if (!isAdminLevel(ctx.profile.role) && ctx.profile.role !== "hr") {
    throw new Error("Admin access required");
  }
  return ctx;
}

export async function createUser(formData: FormData) {
  const { supabase } = await requireAdmin();
  const email = String(formData.get("email") || "").trim();
  const { error } = await supabase.rpc("admin_create_user", {
    p_email: email,
    p_password: String(formData.get("password") || ""),
    p_full_name: String(formData.get("full_name") || "").trim(),
    p_role: String(formData.get("role") || "staff"),
    p_department: String(formData.get("department") || "") || null,
    p_outlet_id: String(formData.get("outlet_id") || "") || null,
  });
  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }
  revalidatePath("/admin/users");
  redirect(`/admin/users?created=${encodeURIComponent(email)}`);
}

export async function updateUser(formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      role: String(formData.get("role")),
      department: String(formData.get("department") || "") || null,
      outlet_id: String(formData.get("outlet_id") || "") || null,
      active: formData.get("active") === "on",
    })
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function saveOutlet(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const values = {
    name: String(formData.get("name")),
    code: String(formData.get("code")).toUpperCase(),
    address: String(formData.get("address") || "") || null,
    active: formData.get("active") !== "off",
  };
  const { error } = id
    ? await supabase.from("outlets").update(values).eq("id", id)
    : await supabase.from("outlets").insert(values);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/outlets");
}

export async function createTemplate(formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("checklist_templates").insert({
    name: String(formData.get("name")),
    description: String(formData.get("description") || "") || null,
    type: String(formData.get("type")),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/templates");
}

export async function toggleTemplate(formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("checklist_templates")
    .update({ active: formData.get("active") === "true" })
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/templates");
}

export async function addItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const templateId = String(formData.get("template_id"));
  const { error } = await supabase.from("checklist_items").insert({
    template_id: templateId,
    position: Number(formData.get("position") || 0),
    text: String(formData.get("text")),
    requires_photo: formData.get("requires_photo") === "on",
    critical: formData.get("critical") === "on",
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function deleteItem(formData: FormData) {
  const { supabase } = await requireAdmin();
  const templateId = String(formData.get("template_id"));
  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("id", String(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/templates/${templateId}`);
}

export async function createSop(formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("sops").insert({
    title: String(formData.get("title")),
    category: String(formData.get("category") || "General"),
    department: String(formData.get("department") || "") || null,
    summary: String(formData.get("summary") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sops");
  revalidatePath("/sops");
}

export async function addSopStep(formData: FormData) {
  const { supabase } = await requireAdmin();
  const sopId = String(formData.get("sop_id"));
  const { error } = await supabase.from("sop_steps").insert({
    sop_id: sopId,
    position: Number(formData.get("position") || 0),
    title: String(formData.get("title")),
    instruction: String(formData.get("instruction") || ""),
    photo_url: String(formData.get("photo_url") || "") || null,
    video_url: String(formData.get("video_url") || "") || null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sops");
  revalidatePath(`/sops/${sopId}`);
}
