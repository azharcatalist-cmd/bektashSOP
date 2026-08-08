"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { isUpper, isOutletManager } from "@/lib/types";

export async function completeTask(taskId: string) {
  const { supabase, profile } = await requireProfile();
  const { error } = await supabase
    .from("onboarding_progress")
    .upsert({ user_id: profile.id, task_id: taskId }, { onConflict: "user_id,task_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/onboarding");
}

export async function verifyTask(progressId: string) {
  const { supabase, profile } = await requireProfile();
  if (!isUpper(profile.role) && !isOutletManager(profile.role)) {
    throw new Error("Only managers can verify onboarding tasks");
  }
  const { error } = await supabase
    .from("onboarding_progress")
    .update({ verified_by: profile.id })
    .eq("id", progressId);
  if (error) throw new Error(error.message);
  revalidatePath("/onboarding");
}
